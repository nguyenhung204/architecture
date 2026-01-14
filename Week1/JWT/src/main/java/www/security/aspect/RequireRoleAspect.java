package www.security.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import www.exception.JwtAuthenticationException;
import www.model.enums.Role;
import www.security.CustomUserDetailsService.UserPrincipal;
import www.security.annotation.RequireRole;

import java.util.Arrays;

/**
 * Aspect to handle @RequireRole annotation.
 * Checks if the authenticated user has the required role(s).
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RequireRoleAspect {

    @Around("@annotation(requireRole) || @within(requireRole)")
    public Object handleRequireRole(ProceedingJoinPoint joinPoint, RequireRole requireRole) throws Throwable {
        // Get current authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("No authentication found for role-protected endpoint");
            throw new JwtAuthenticationException("Authentication required");
        }

        // Get user principal
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserPrincipal)) {
            log.warn("Invalid principal type: {}", principal.getClass().getSimpleName());
            throw new JwtAuthenticationException("Invalid authentication");
        }

        UserPrincipal userPrincipal = (UserPrincipal) principal;
        
        // Get current request info for logging
        HttpServletRequest request = getCurrentRequest();
        String endpoint = request != null ? request.getRequestURI() : "unknown";
        
        // Check if user has required role(s)
        boolean hasAccess = checkRoleAccess(userPrincipal, requireRole);
        
        if (!hasAccess) {
            log.warn("User {} does not have required role(s) {} for endpoint: {}", 
                    userPrincipal.getId(), 
                    Arrays.toString(requireRole.value()), 
                    endpoint);
            throw new AccessDeniedException(requireRole.message());
        }

        log.debug("User {} has access to role-protected endpoint: {}", userPrincipal.getId(), endpoint);
        return joinPoint.proceed();
    }

    private boolean checkRoleAccess(UserPrincipal userPrincipal, RequireRole requireRole) {
        // Note: UserPrincipal would need to expose user role
        // This is a simplified implementation - you may need to modify UserPrincipal
        // or get user role from the database
        
        Role[] requiredRoles = requireRole.value();
        boolean requireAll = requireRole.requireAll();
        
        // Get user role from authorities or database
        // For now, we'll assume the role is available from authorities
        Role userRole = getUserRoleFromAuthorities(userPrincipal);
        
        if (userRole == null) {
            return false;
        }

        if (requireAll) {
            // User must have all required roles (in this simple case, check if user role is ADMIN for multiple roles)
            return userRole == Role.ADMIN || Arrays.asList(requiredRoles).contains(userRole);
        } else {
            // User must have at least one of the required roles
            return Arrays.asList(requiredRoles).contains(userRole) || userRole == Role.ADMIN;
        }
    }

    private Role getUserRoleFromAuthorities(UserPrincipal userPrincipal) {
        // Extract role from authorities
        // Authority format: "ROLE_USER", "ROLE_ADMIN", etc.
        return userPrincipal.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> auth.substring(5)) // Remove "ROLE_" prefix
                .map(roleString -> {
                    try {
                        return Role.valueOf(roleString);
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid role in authorities: {}", roleString);
                        return null;
                    }
                })
                .filter(role -> role != null)
                .findFirst()
                .orElse(null);
    }
    
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return attributes.getRequest();
        } catch (Exception e) {
            return null;
        }
    }
}