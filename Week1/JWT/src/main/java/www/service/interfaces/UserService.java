package www.service.interfaces;

import www.model.dto.request.UpdateProfileRequest;
import www.model.entity.User;

import java.util.Optional;

public interface UserService {
    User createUser(String email, String fullName, String password);
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
    boolean existsByEmail(String email);
    User enableUser(String email);
    User updateUser(User user);
    User updateProfile(String userId, UpdateProfileRequest request);
    void changePassword(String userId, String newPassword);
}