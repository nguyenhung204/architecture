package www.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import www.model.dto.request.*;
import www.model.dto.response.ApiResponse;
import www.model.dto.response.AuthResponse;
import www.model.dto.response.UserResponse;
import www.security.CustomUserDetailsService.UserPrincipal;
import www.service.interfaces.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        try {
            authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("Registration successful. Please check your email for OTP verification."));
        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("OTP verification attempt for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.verifyOtp(request, httpRequest, httpResponse);
            return ResponseEntity.ok(ApiResponse.success("Account verified successfully", response));
        } catch (Exception e) {
            log.error("OTP verification failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("Login attempt for email: {}", request.getEmail());
        try {
            AuthResponse response = authService.login(request, httpRequest, httpResponse);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("Token refresh attempt");
        try {
            AuthResponse response = authService.refresh(httpRequest, httpResponse);
            return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest httpRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletResponse httpResponse) {
        
        try {
            log.info("Logout attempt for user: {}", userPrincipal.getId());
            authService.logout(httpRequest, userPrincipal.getId(), httpResponse);
            return ResponseEntity.ok(ApiResponse.success("Logout successful"));
        } catch (Exception e) {
            log.error("Logout failed for user: {}", userPrincipal.getId(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Logout failed"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            log.info("Get current user info for user: {}", userPrincipal.getId());
            UserResponse response = authService.getCurrentUser(userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("User info retrieved successfully", response));
        } catch (Exception e) {
            log.error("Failed to get current user info for user: {}", userPrincipal.getId(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get user info"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());
        try {
            authService.forgotPassword(request);
            return ResponseEntity.ok(ApiResponse.success("Reset password OTP sent to your email"));
        } catch (Exception e) {
            log.error("Forgot password failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request with OTP");
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
        } catch (Exception e) {
            log.error("Reset password failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            log.info("Change password request for user: {}", userPrincipal.getId());
            authService.changePassword(userPrincipal.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
        } catch (Exception e) {
            log.error("Change password failed for user: {}", userPrincipal.getId(), e);
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            log.info("Update profile request for user: {}", userPrincipal.getId());
            UserResponse response = authService.updateProfile(userPrincipal.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (Exception e) {
            log.error("Update profile failed for user: {}", userPrincipal.getId(), e);
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }
}