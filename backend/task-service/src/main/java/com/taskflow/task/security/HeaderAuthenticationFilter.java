package com.taskflow.task.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

  public static final String HEADER_USER_ID = "X-User-Id";
  public static final String HEADER_USER_ROLES = "X-User-Roles";

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String userIdHeader = request.getHeader(HEADER_USER_ID);
    if (userIdHeader != null && !userIdHeader.isBlank()) {
      UUID userId = UUID.fromString(userIdHeader.trim());
      String rolesHeader = request.getHeader(HEADER_USER_ROLES);
      List<SimpleGrantedAuthority> authorities =
          rolesHeader == null || rolesHeader.isBlank()
              ? List.of()
              : Arrays.stream(rolesHeader.split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .map(SimpleGrantedAuthority::new)
                  .collect(Collectors.toList());
      TaskFlowUser principal = new TaskFlowUser(userId, authorities);
      SecurityContextHolder.getContext()
          .setAuthentication(new UsernamePasswordAuthenticationToken(principal, null, authorities));
    }
    filterChain.doFilter(request, response);
  }
}
