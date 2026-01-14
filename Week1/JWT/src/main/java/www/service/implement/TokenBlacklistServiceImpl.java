package www.service.implement;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import www.service.interfaces.JwtService;
import www.service.interfaces.TokenBlacklistService;

import java.util.Date;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistServiceImpl implements TokenBlacklistService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtService jwtService;
    private static final String BLACKLIST_PREFIX = "blacklist:token:";

    @Override
    public void blacklistToken(String token) {
        try {
            // Extract token ID or use token hash for key
            String tokenKey = BLACKLIST_PREFIX + token.hashCode();
            
            // Calculate remaining TTL of the token
            long remainingTtl = getRemainingTokenTtl(token);
            
            if (remainingTtl > 0) {
                // Store in Redis with TTL equal to token's remaining time
                redisTemplate.opsForValue().set(tokenKey, "blacklisted", remainingTtl, TimeUnit.MILLISECONDS);
                log.info("Token blacklisted with TTL: {} ms", remainingTtl);
            }
        } catch (Exception e) {
            log.error("Error blacklisting token", e);
        }
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        try {
            String tokenKey = BLACKLIST_PREFIX + token.hashCode();
            return redisTemplate.hasKey(tokenKey);
        } catch (Exception e) {
            log.error("Error checking token blacklist", e);
            return false; // Fail open - allow access if Redis is down
        }
    }

    @Override
    public void cleanupExpiredTokens() {
        try {
            String pattern = BLACKLIST_PREFIX + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                // Redis TTL will automatically clean up expired keys
                // This method is for manual cleanup if needed
                log.info("Found {} blacklisted tokens in Redis", keys.size());
            }
        } catch (Exception e) {
            log.error("Error during blacklist cleanup", e);
        }
    }

    private long getRemainingTokenTtl(String token) {
        try {
            Date expiration = jwtService.getExpirationFromToken(token);
            long currentTime = System.currentTimeMillis();
            long expirationTime = expiration.getTime();
            long remainingTtl = expirationTime - currentTime;
            
            return Math.max(0, remainingTtl); // Ensure non-negative TTL
        } catch (Exception e) {
            log.error("Error calculating token TTL", e);
            return 15 * 60 * 1000; // Default fallback
        }
    }
}