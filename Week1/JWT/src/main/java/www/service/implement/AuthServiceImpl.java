package www.service.implement;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import www.exception.AuthException;
import www.model.dto.request.*;
import www.model.dto.response.AuthResponse;
import www.model.dto.response.UserResponse;
import www.model.entity.User;
import www.service.interfaces.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    
    private final UserService userService;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final SessionService sessionService;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        // Check if user already exists
        if (userService.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already exists");
        }

        try {
            // Create user
            User user = userService.createUser(
                    request.getEmail(),
                    request.getFullName(),
                    request.getPassword()
            );

            // Generate and save OTP
            String otp = otpService.generateOtp();
            otpService.saveOtp(request.getEmail(), otp);

            // Send OTP email
            mailService.sendOtpMail(request.getEmail(), otp);

            log.info("User registered successfully: {}", request.getEmail());

        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            throw new AuthException("Registration failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        // Validate OTP
        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new AuthException("Invalid or expired OTP");
        }

        try {
            // Enable user
            User user = userService.enableUser(request.getEmail());

            // Create session
            String userAgent = httpRequest.getHeader("User-Agent");
            String ip = getClientIpAddress(httpRequest);
            String sessionId = sessionService.createSession(user.getId(), userAgent, ip);

            // Generate access token
            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

            // Set access token cookie
            setAccessTokenCookie(httpResponse, accessToken);

            // Get refresh token and set cookie
            String refreshToken = sessionService.getRefreshToken(user.getId(), sessionId);
            setRefreshTokenCookie(httpResponse, refreshToken);

            // Create user response
            UserResponse userResponse = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole())
                    .enabled(user.isEnabled())
                    .build();

            log.info("OTP verified and user enabled: {}", request.getEmail());
            return AuthResponse.builder()
                    .user(userResponse)
                    .build();

        } catch (Exception e) {
            log.error("OTP verification failed for email: {}", request.getEmail(), e);
            throw new AuthException("OTP verification failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        // Find user
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Invalid email or password");
        }

        // Check if user is enabled
        if (!user.isEnabled()) {
            throw new AuthException("Account not verified. Please verify your email first.");
        }

        try {
            // Create session
            String userAgent = httpRequest.getHeader("User-Agent");
            String ip = getClientIpAddress(httpRequest);
            String sessionId = sessionService.createSession(user.getId(), userAgent, ip);

            // Generate access token
            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

            // Set access token cookie
            setAccessTokenCookie(httpResponse, accessToken);

            // Get refresh token and set cookie
            String refreshToken = sessionService.getRefreshToken(user.getId(), sessionId);
            setRefreshTokenCookie(httpResponse, refreshToken);

            // Create user response
            UserResponse userResponse = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole())
                    .enabled(user.isEnabled())
                    .build();

            log.info("User logged in successfully: {}", request.getEmail());
            return AuthResponse.builder()
                    .user(userResponse)
                    .build();

        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            throw new AuthException("Login failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AuthResponse refresh(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        try {
            // Get refresh token from cookie
            String refreshToken = getRefreshTokenFromCookie(httpRequest);
            if (refreshToken == null) {
                throw new AuthException("Refresh token not found in cookies");
            }

            // Validate refresh token (JWT-based validation)
            if (!sessionService.validateRefreshToken(refreshToken)) {
                throw new AuthException("Invalid or expired refresh token");
            }

            // Extract userId and sessionId from refresh token
            String userId = jwtService.getUserIdFromToken(refreshToken);
            String sessionId = jwtService.getSessionIdFromRefreshToken(refreshToken);

            // Get user
            User user = userService.findById(userId)
                    .orElseThrow(() -> new AuthException("User not found"));

            // Generate new access token
            String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());

            // Set access token cookie
            setAccessTokenCookie(httpResponse, accessToken);

            // Create user response
            UserResponse userResponse = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole())
                    .enabled(user.isEnabled())
                    .build();

            log.info("Token refreshed successfully for user: {}", userId);
            return AuthResponse.builder()
                    .user(userResponse)
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed", e);
            throw new AuthException("Token refresh failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest httpRequest, String userId, HttpServletResponse httpResponse) {
        try {
            // Get access token from cookie and blacklist it
            String accessToken = getAccessTokenFromCookie(httpRequest);
            if (accessToken != null) {
                tokenBlacklistService.blacklistToken(accessToken);
                log.info("Access token blacklisted for user: {}", userId);
            }

            // Get refresh token from cookie to extract session info
            String refreshToken = getRefreshTokenFromCookie(httpRequest);
            if (refreshToken != null) {
                try {
                    String sessionId = jwtService.getSessionIdFromRefreshToken(refreshToken);
                    // Delete session
                    sessionService.deleteSession(userId, sessionId);
                } catch (Exception e) {
                    log.warn("Could not extract session ID from refresh token during logout: {}", e.getMessage());
                }
            }

            // Clear both cookies
            clearAccessTokenCookie(httpResponse);
            clearRefreshTokenCookie(httpResponse);

            log.info("User logged out successfully: {}", userId);
        } catch (Exception e) {
            log.error("Logout failed for user: {}", userId, e);
            throw new RuntimeException("Logout failed", e);
        }
    }

    @Override
    public UserResponse getCurrentUser(String userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .gender(user.getGender())
                .identityNumber(user.getIdentityNumber())
                .enabled(user.isEnabled())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private void setAccessTokenCookie(HttpServletResponse response, String accessToken) {
        Cookie cookie = new Cookie("access_token", accessToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(15 * 60); // 15 minutes
        response.addCookie(cookie);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);
    }

    private void clearAccessTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("access_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String getAccessTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    // Password management methods
    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Check if user exists
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Email not found"));

        // Check if user is enabled
        if (!user.isEnabled()) {
            throw new AuthException("Account not verified. Please verify your email first.");
        }

        try {
            // Generate and save OTP
            String otp = otpService.generateOtp();
            otpService.saveOtp(request.getEmail(), otp);

            // Send reset password email
            mailService.sendResetPasswordMail(request.getEmail(), otp);

            log.info("Reset password OTP sent to email: {}", request.getEmail());

        } catch (Exception e) {
            log.error("Failed to send reset password OTP for email: {}", request.getEmail(), e);
            throw new AuthException("Failed to send reset password OTP: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AuthException("Passwords do not match");
        }

        // Get email from OTP
        String email = otpService.getEmailByOtp(request.getOtp())
                .orElseThrow(() -> new AuthException("Invalid or expired OTP"));

        // Validate OTP (this will also delete the OTP)
        if (!otpService.validateOtp(email, request.getOtp())) {
            throw new AuthException("Invalid or expired OTP");
        }

        // Find user
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));

        try {
            // Update password
            userService.changePassword(user.getId(), request.getNewPassword());

            // Invalidate all existing sessions for this user
            sessionService.deleteAllUserSessions(user.getId());

            log.info("Password reset successfully for email: {}", email);

        } catch (Exception e) {
            log.error("Password reset failed for email: {}", email, e);
            throw new AuthException("Password reset failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AuthException("Passwords do not match");
        }

        // Find user
        User user = userService.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AuthException("Current password is incorrect");
        }

        // Check if new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AuthException("New password must be different from current password");
        }

        try {
            // Update password
            userService.changePassword(userId, request.getNewPassword());

            // Invalidate all other sessions for this user (keep current session)
            sessionService.deleteAllUserSessions(userId);

            log.info("Password changed successfully for user: {}", userId);

        } catch (Exception e) {
            log.error("Password change failed for user: {}", userId, e);
            throw new AuthException("Password change failed: " + e.getMessage(), e);
        }
    }

    // Profile management methods
    @Override
    @Transactional
    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        try {
            User updatedUser = userService.updateProfile(userId, request);

            return UserResponse.builder()
                    .id(updatedUser.getId())
                    .email(updatedUser.getEmail())
                    .fullName(updatedUser.getFullName())
                    .phone(updatedUser.getPhone())
                    .address(updatedUser.getAddress())
                    .gender(updatedUser.getGender())
                    .identityNumber(updatedUser.getIdentityNumber())
                    .role(updatedUser.getRole())
                    .enabled(updatedUser.isEnabled())
                    .createdAt(updatedUser.getCreatedAt())
                    .updatedAt(updatedUser.getUpdatedAt())
                    .build();

        } catch (Exception e) {
            log.error("Profile update failed for user: {}", userId, e);
            throw new AuthException("Profile update failed: " + e.getMessage(), e);
        }
    }
}