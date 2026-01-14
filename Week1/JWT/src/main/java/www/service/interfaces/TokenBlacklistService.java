package www.service.interfaces;

public interface TokenBlacklistService {
    void blacklistToken(String token);
    boolean isTokenBlacklisted(String token);
    void cleanupExpiredTokens();
}