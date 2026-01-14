package www.security.annotation;

import www.model.enums.Role;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to specify required roles for accessing an endpoint.
 * The user must have at least one of the specified roles.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    /**
     * Required roles. User must have at least one of these roles.
     */
    Role[] value();
    
    /**
     * Whether all roles are required (AND) or any role is sufficient (OR).
     * Default is OR (any role is sufficient).
     */
    boolean requireAll() default false;
    
    /**
     * Custom error message when access is denied
     */
    String message() default "Insufficient permissions";
}
