package www.service.interfaces;

import www.model.enums.Role;

import java.util.Date;

public interface JwtService {
    String generateAccessToken(String userId, String email, Role role);
    String generateRefreshToken(String userId, String sessionId);
    String getUserIdFromToken(String token);
    String getSessionIdFromRefreshToken(String token);
    Role getRoleFromToken(String token);
    Date getExpirationFromToken(String token);
    boolean validateToken(String token);
    boolean validateRefreshToken(String token);
}