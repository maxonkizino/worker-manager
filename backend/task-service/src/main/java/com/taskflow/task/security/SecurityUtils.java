package com.taskflow.task.security;

import com.taskflow.task.exception.BadRequestException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

  private SecurityUtils() {}

  public static UUID requireUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof TaskFlowUser user) {
      return user.getUserId();
    }
    throw new BadRequestException("Missing X-User-Id header");
  }

  public static UUID currentUserIdOr(UUID fallback) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof TaskFlowUser user) {
      return user.getUserId();
    }
    return fallback;
  }

  public static boolean hasRole(String role) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null) {
      return false;
    }
    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
    for (GrantedAuthority granted : auth.getAuthorities()) {
      if (authority.equals(granted.getAuthority())) {
        return true;
      }
    }
    return false;
  }

  public static boolean isEmployeeOnly() {
    return hasRole("EMPLOYEE") && !hasRole("MANAGER") && !hasRole("ADMIN");
  }
}
