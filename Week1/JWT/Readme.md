# Authentication System Documentation

### JWT Token Strategy
```
Access Token (15 minutes)               Refresh Token (7 days)
┌─────────────────────────┐           ┌─────────────────────────┐
│ • User ID (subject)     │           │ • User ID (subject)     │
│ • Role                  │           │ • Session ID            │
│ • Issued At             │           │ • Issued At             │
│ • Expiration            │           │ • Expiration            │
└─────────────────────────┘           └─────────────────────────┘
         │                                         │
         ▼                                         ▼
   Used for API calls                    Used for token refresh
   (identified by role claim)            (identified by sessionId claim)
```

### Cookie-based Token Storage
- **HttpOnly Cookies**: Prevent XSS attacks
- **Secure Flag**: HTTPS-only transmission
- **Path Restriction**: Limited to specific routes
- **Automatic Expiration**: Browser-managed TTL

### Security Layers
1. **Spring Security Filter Chain**: URL-based protection
2. **JWT Authentication Filter**: Token validation
3. **Token Blacklist**: Revoked token protection
4. **Role-based Authorization**: AOP-based method security
5. **Session Management**: Redis-based session tracking

## Project Structure

```
src/main/java/www/
├── config/
│   ├── AopConfig.java                 # AOP configuration for method security
│   ├── CorsConfig.java                # Cross-origin resource sharing
│   ├── GlobalExceptionHandler.java    # Centralized error handling
│   ├── JacksonConfig.java             # JSON serialization configuration
│   ├── JwtProperties.java             # JWT configuration properties
│   ├── MongoConfig.java               # MongoDB configuration
│   ├── RedisConfig.java               # Redis configuration
│   └── SecurityConfig.java            # Spring Security configuration
├── controller/
│   ├── AuthController.java            # Authentication endpoints
│   └── ExampleController.java         # Demo role-based endpoints
├── exception/
│   ├── AuthException.java             # Business logic errors
│   ├── JwtAuthenticationException.java # JWT technical errors
│   └── TokenBlacklistedException.java  # Token revocation errors
├── model/
│   ├── dto/
│   │   ├── request/                   # Request DTOs with validation
│   │   └── response/                  # Response DTOs with JSON config
│   ├── entity/                        # MongoDB entities
│   └── enums/                         # System enumerations
├── repository/
│   └── UserRepository.java           # MongoDB data access
├── security/
│   ├── annotation/
│   │   └── RequireRole.java          # Role-based method annotation
│   ├── aspect/
│   │   └── RequireRoleAspect.java    # AOP implementation for roles
│   ├── CustomUserDetailsService.java # Spring Security integration
│   ├── JwtAccessDeniedHandler.java   # 403 error handling
│   ├── JwtAuthenticationEntryPoint.java # 401 error handling
│   ├── JwtAuthenticationFilter.java  # JWT token processing
│   └── JwtTokenProvider.java         # JWT creation/validation
└── service/
    ├── interfaces/                    # Service contracts
    └── implement/                     # Service implementations
```

## Authentication Flows

### 1. User Registration Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   MongoDB   │    │    Redis    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ POST /auth/register│                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ Check email exists│                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ Create user       │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ Generate OTP      │                   │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Send email OTP    │                   │
       │                   │                   │                   │
       │ ◄──────────────────┤                   │                   │
       │ Success message    │                   │                   │
```

**Steps:**
1. Client sends registration data (email, fullName, password)
2. Server validates input and checks email uniqueness
3. Creates user in MongoDB with `enabled: false`
4. Generates 6-digit OTP with 2-minute expiration
5. Stores OTP in Redis with TTL
6. Sends OTP via email
7. Returns success message

### 2. OTP Verification Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   MongoDB   │    │    Redis    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ POST /auth/verify-otp                 │                   │
       ├──────────────────►│                   │                   │
       │                   │ Validate OTP      │                   │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Enable user       │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ Create session    │                   │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Generate tokens   │                   │
       │                   │                   │                   │
       │ ◄──────────────────┤                   │                   │
       │ Set cookies + user │                   │                   │
```

**Steps:**
1. Client sends email and OTP code
2. Server validates OTP from Redis
3. Enables user account in MongoDB
4. Creates session in Redis with metadata
5. Generates JWT access and refresh tokens
6. Sets HttpOnly cookies
7. Returns user information

### 3. Login Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   MongoDB   │    │    Redis    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ POST /auth/login  │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ Find user         │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ Validate password │                   │
       │                   │                   │                   │
       │                   │ Create session    │                   │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Generate tokens   │                   │
       │                   │                   │                   │
       │ ◄──────────────────┤                   │                   │
       │ Set cookies + user │                   │                   │
```

**Steps:**
1. Client sends email and password
2. Server finds user in MongoDB
3. Validates password using BCrypt
4. Checks if account is enabled
5. Creates new session in Redis
6. Generates JWT tokens
7. Sets cookies and returns user data

### 4. API Request Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │JWT Filter   │    │    Redis    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ API Request + Cookies                │
       ├──────────────────►│                   │
       │                   │ Extract token     │
       │                   │                   │
       │                   │ Validate JWT      │
       │                   │                   │
       │                   │ Check blacklist   │
       │                   ├─────────────────►│
       │                   │                   │
       │                   │ Load UserDetails  │
       │                   │                   │
       │                   │ Set SecurityContext
       │                   │                   │
       │ ◄──────────────────┤                   │
       │ Process request    │                   │
```

**Steps:**
1. Client sends request with cookies
2. JWT Filter extracts access token
3. Validates JWT signature and expiration
4. Checks token blacklist in Redis
5. Loads user details and authorities
6. Sets Spring Security context
7. Proceeds to controller

### 5. Token Refresh Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   MongoDB   │    │    Redis    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ POST /auth/refresh│                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ Validate refresh token               │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Extract user ID   │                   │
       │                   │                   │                   │
       │                   │ Get user data     │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ Generate new access token            │
       │                   │                   │                   │
       │ ◄──────────────────┤                   │                   │
       │ New access token  │                   │                   │
```

**Steps:**
1. Client requests token refresh
2. Server validates refresh token from cookie
3. Checks session exists in Redis
4. Extracts user information
5. Generates new access token
6. Updates access token cookie
7. Returns user information

### 6. Password Reset Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   MongoDB   │    │    Redis    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ POST /auth/forgot-password            │                   │
       ├──────────────────►│                   │                   │
       │                   │ Find user         │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ Generate OTP      │                   │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Send reset email  │                   │
       │                   │                   │                   │
       │ ◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ POST /auth/reset-password             │                   │
       ├──────────────────►│                   │                   │
       │                   │ Get email from OTP│                   │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Validate OTP      │                   │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ Update password   │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │                   │
       │                   │ Invalidate sessions                  │
       │                   ├─────────────────────────────────────►│
       │                   │                   │                   │
       │ ◄──────────────────┤                   │                   │
       │ Success message    │                   │                   │
```

**Steps:**
1. **Forgot Password**: Client sends email, server generates OTP and sends email
2. **Reset Password**: Client sends OTP + new password
3. Server finds email associated with OTP
4. Validates OTP and password confirmation
5. Updates password in MongoDB
6. Invalidates all existing sessions
7. Returns success message

### 7. Logout Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │    Redis    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ POST /auth/logout │                   │
       ├──────────────────►│                   │
       │                   │ Blacklist access token
       │                   ├─────────────────►│
       │                   │                   │
       │                   │ Delete session    │
       │                   ├─────────────────►│
       │                   │                   │
       │                   │ Clear cookies     │
       │                   │                   │
       │ ◄──────────────────┤                   │
       │ Success message    │                   │
```

**Steps:**
1. Client initiates logout
2. Server adds access token to blacklist
3. Deletes session from Redis
4. Clears authentication cookies
5. Returns success confirmation

## Security Features

### Token Management
- **JWT Structure**: Header + Payload + Signature with HS512
- **Access Token**: 15-minute lifespan for API calls
- **Refresh Token**: 7-day lifespan for token renewal
- **Token Blacklist**: Immediate revocation capability
- **Secure Storage**: HttpOnly cookies prevent client-side access

### Session Security
- **Redis Sessions**: Server-side session validation
- **Session Metadata**: User-Agent, IP address tracking
- **Automatic Cleanup**: TTL-based session expiration
- **Multi-device Support**: Multiple concurrent sessions per user

### Password Security
- **BCrypt Hashing**: Industry-standard password encryption
- **Strength Validation**: Minimum 6 characters requirement
- **Password Change**: Current password verification required
- **Reset Security**: OTP-based password reset only

### Authorization Framework
- **Role-based Access**: USER, EMPLOYEE, ADMIN hierarchy
- **Method Security**: `@RequireRole` annotation support
- **URL Security**: Spring Security configuration
- **Dynamic Permissions**: AOP-based role checking

### Attack Prevention
- **XSS Protection**: HttpOnly cookies
- **CSRF Protection**: Stateless JWT approach
- **Brute Force**: Account lockout via enabled flag
- **Token Replay**: Blacklist mechanism
- **Session Fixation**: New session on login

## Data Models

### User Entity
```java
@Document(collection = "users")
public class User {
    @Id private String id;
    @Indexed(unique = true) private String email;
    private String fullName;
    private String password;          // BCrypt encoded
    private String phone;             // Optional
    private String address;           // Optional
    private Gender gender;            // Optional enum
    private String identityNumber;    // Optional
    private boolean enabled;          // Account verification status
    private Role role;                // USER/EMPLOYEE/ADMIN
    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;
}
```

### Session Entity
```java
public class Session {
    private String sessionId;         // UUID
    private String userId;            // User reference
    private String refreshToken;      // JWT refresh token
    private String userAgent;         // Browser/app info
    private String ip;                // Client IP address
    private LocalDateTime createdAt;  // Session start time
    private LocalDateTime expiresAt;  // Session expiration
}
```

### OTP Entity
```java
public class OtpCode {
    private String email;             // Target email
    private String code;              // 6-digit numeric code
    private LocalDateTime expiresAt;  // 2-minute expiration
}
```

## Error Handling

### Exception Hierarchy
```
RuntimeException
├── AuthException                    # Business logic errors
├── JwtAuthenticationException       # JWT technical errors
│   └── TokenBlacklistedException   # Revoked token errors
└── UsernameNotFoundException       # Spring Security errors
```

### HTTP Status Codes
- **200**: Successful operations
- **400**: Bad Request (validation errors, business logic)
- **401**: Unauthorized (invalid/expired tokens)
- **403**: Forbidden (insufficient permissions)
- **500**: Internal Server Error

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AuthException.class)          // → 400
    @ExceptionHandler(TokenBlacklistedException.class) // → 401
    @ExceptionHandler(JwtAuthenticationException.class) // → 401
    @ExceptionHandler(AccessDeniedException.class)  // → 403
    @ExceptionHandler(Exception.class)              // → 500
}
```

## Configuration

### Security Configuration
```java
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // Public endpoints: /auth/register, /auth/login, etc.
    // Protected endpoints: Everything else requires authentication
    // JWT filter chain integration
    // Custom exception handlers
}
```

### JWT Properties
```yaml
jwt:
  secret: "your-secret-key"           # HS512 signing key
  access-token:
    expiration: 900000                # 15 minutes
  refresh-token:
    expiration: 604800000             # 7 days
```

### Redis Configuration
```yaml
spring:
  redis:
    host: localhost
    port: 6379
    timeout: 2000ms
  # Session prefix: "session:"
  # OTP prefix: "otp:"
  # Blacklist prefix: "blacklist:"
```

## API Endpoints

### Public Endpoints (No Authentication Required)
```
POST /auth/register              # User registration
POST /auth/verify-otp           # Account verification
POST /auth/login                # User login
POST /auth/refresh              # Token refresh
POST /auth/forgot-password      # Password reset request
POST /auth/reset-password       # Password reset execution
```

### Protected Endpoints (Authentication Required)
```
GET  /auth/me                   # Current user info
POST /auth/logout               # User logout
POST /auth/change-password      # Password change
PUT  /auth/profile              # Profile update
```
