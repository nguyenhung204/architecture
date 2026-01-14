package www.service.interfaces;

import www.model.entity.Session;

import java.util.Optional;
import java.util.Set;

public interface SessionService {
    String createSession(String userId, String userAgent, String ip);
    Optional<Session> getSession(String userId, String sessionId);
    boolean validateRefreshToken(String refreshToken);
    void deleteSession(String userId, String sessionId);

    void deleteAllUserSessions(String userId);

    String getRefreshToken(String userId, String sessionId);
}