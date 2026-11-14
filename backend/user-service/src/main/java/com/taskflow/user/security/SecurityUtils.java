package com.taskflow.user.security;

import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof TaskflowUserPrincipal principal) {
            return principal.getUserId();
        }
        return null;
    }

    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        for (GrantedAuthority granted : authentication.getAuthorities()) {
            if (authority.equals(granted.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
