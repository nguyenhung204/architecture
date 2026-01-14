package www.service.implement;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import www.model.entity.Session;
import www.service.interfaces.JwtService;
import www.service.interfaces.SessionService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionServiceImpl implements SessionService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService;
    private static final String SESSION_PREFIX = "refresh:";
    private static final int REFRESH_TOKEN_EXPIRATION_DAYS = 7;

    @Override
    public String createSession(String userId, String userAgent, String ip) {
        String sessionId = UUID.randomUUID().toString();
        String refreshToken = jwtService.generateRefreshToken(userId, sessionId);
        
        Session session = Session.builder()
                .sessionId(sessionId)
                .userId(userId)
                .refreshToken(refreshToken)
                .userAgent(userAgent)
                .ip(ip)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRATION_DAYS))
                .build();

        String key = SESSION_PREFIX + userId + ":" + sessionId;
        redisTemplate.opsForValue().set(key, session, REFRESH_TOKEN_EXPIRATION_DAYS, TimeUnit.DAYS);
        
        log.info("Created session {} for user {}", sessionId, userId);
        return sessionId;
    }

    @Override
    public Optional<Session> getSession(String userId, String sessionId) {
        String key = SESSION_PREFIX + userId + ":" + sessionId;
        Object sessionData = redisTemplate.opsForValue().get(key);
        
        if (sessionData == null) {
            return Optional.empty();
        }
        
        try {
            // Convert LinkedHashMap to Session
            Session session = objectMapper.convertValue(sessionData, Session.class);
            return Optional.of(session);
        } catch (Exception e) {
            log.error("Error converting session data for user {} session {}", userId, sessionId, e);
            return Optional.empty();
        }
    }

    @Override
    public boolean validateRefreshToken(String refreshToken) {
        try {
            // First validate the JWT structure and signature
            if (!jwtService.validateRefreshToken(refreshToken)) {
                log.warn("Invalid JWT refresh token structure");
                return false;
            }

            // Extract userId and sessionId from token
            String userId = jwtService.getUserIdFromToken(refreshToken);
            String sessionId = jwtService.getSessionIdFromRefreshToken(refreshToken);

            // Check if session exists in Redis
            Optional<Session> sessionOpt = getSession(userId, sessionId);
            
            if (sessionOpt.isEmpty()) {
                log.warn("Session not found: {} for user {}", sessionId, userId);
                return false;
            }

            Session session = sessionOpt.get();
            
            // Check if session has expired
            if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
                log.warn("Session expired: {} for user {}", sessionId, userId);
                deleteSession(userId, sessionId);
                return false;
            }

            // Compare the stored refresh token with the provided one
            boolean isValid = session.getRefreshToken().equals(refreshToken);
            if (!isValid) {
                log.warn("Refresh token mismatch for session: {} user: {}", sessionId, userId);
            }

            return isValid;
        } catch (Exception e) {
            log.error("Error validating refresh token", e);
            return false;
        }
    }

    @Override
    public void deleteSession(String userId, String sessionId) {
        String key = SESSION_PREFIX + userId + ":" + sessionId;
        redisTemplate.delete(key);
        log.info("Deleted session {} for user {}", sessionId, userId);
    }

    @Override
    public void deleteAllUserSessions(String userId) {
        String pattern = SESSION_PREFIX + userId + ":*";
        var keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("Deleted all sessions for user {}", userId);
        }
    }

    @Override
    public String getRefreshToken(String userId, String sessionId) {
        Optional<Session> sessionOpt = getSession(userId, sessionId);
        return sessionOpt.map(Session::getRefreshToken).orElse(null);
    }

}