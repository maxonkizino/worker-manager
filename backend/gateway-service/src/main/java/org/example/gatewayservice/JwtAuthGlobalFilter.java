package org.example.gatewayservice;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collection;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthGlobalFilter implements GlobalFilter, Ordered {

    static final String USER_ID = "X-User-Id";
    static final String USER_ROLES = "X-User-Roles";
    private static final int RATE_LIMIT = 300;

    private final SecretKey key;
    private final ObjectProvider<ReactiveStringRedisTemplate> redisProvider;

    public JwtAuthGlobalFilter(
            @Value("${jwt.secret}") String secret, ObjectProvider<ReactiveStringRedisTemplate> redisProvider) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.redisProvider = redisProvider;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (path.startsWith("/internal/") || path.contains("/internal/")) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        ServerHttpRequest.Builder builder = request.mutate();
        builder.headers(headers -> {
            headers.remove(USER_ID);
            headers.remove(USER_ROLES);
        });

        return allowRequest(exchange, path).flatMap(allowed -> {
            if (!allowed) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                return exchange.getResponse().setComplete();
            }
            if (isPublic(request)) {
                return chain.filter(exchange.mutate().request(builder.build()).build());
            }
            String authorization = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(authorization.substring(7))
                        .getPayload();
                return rejectedAccessToken(claims.getId()).flatMap(rejected -> {
                    if (rejected) {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }
                    builder.header(USER_ID, claims.getSubject());
                    builder.header(USER_ROLES, rolesHeader(claims.get("roles")));
                    return chain.filter(exchange.mutate().request(builder.build()).build());
                });
            } catch (RuntimeException ex) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        });
    }

    private Mono<Boolean> allowRequest(ServerWebExchange exchange, String path) {
        ReactiveStringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return Mono.just(true);
        }
        String key = "rl:" + clientIp(exchange) + ":" + routeGroup(path);
        return redis.opsForValue()
                .increment(key)
                .flatMap(count -> {
                    Mono<Boolean> window = count == 1 ? redis.expire(key, Duration.ofMinutes(1)) : Mono.just(true);
                    return window.thenReturn(count <= RATE_LIMIT);
                })
                .onErrorReturn(true);
    }

    private Mono<Boolean> rejectedAccessToken(String jti) {
        ReactiveStringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null || jti == null || jti.isBlank()) {
            return Mono.just(false);
        }
        return redis.hasKey("auth:blacklist:" + jti).onErrorReturn(false);
    }

    private static String clientIp(ServerWebExchange exchange) {
        String forwarded = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        InetSocketAddress remote = exchange.getRequest().getRemoteAddress();
        return remote == null || remote.getAddress() == null ? "unknown" : remote.getAddress().getHostAddress();
    }

    private static String routeGroup(String path) {
        String[] parts = path.split("/");
        if (parts.length >= 3) {
            return parts[1] + "/" + parts[2];
        }
        return path;
    }

    private boolean isPublic(ServerHttpRequest request) {
        if (HttpMethod.OPTIONS.equals(request.getMethod())) {
            return true;
        }
        String path = request.getURI().getPath();
        if (path.startsWith("/actuator")) {
            return true;
        }
        if (HttpMethod.GET.equals(request.getMethod()) && path.matches("/api/employees/[0-9a-fA-F\\-]{36}/avatar")) {
            return true;
        }
        return HttpMethod.POST.equals(request.getMethod())
                && (path.equals("/api/auth/login")
                        || path.equals("/api/auth/register")
                        || path.equals("/api/auth/refresh"));
    }

    private String rolesHeader(Object roles) {
        if (roles instanceof Collection<?> collection) {
            return collection.stream().map(Object::toString).collect(Collectors.joining(","));
        }
        if (roles instanceof String value) {
            return value;
        }
        return "";
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
