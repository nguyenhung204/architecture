package www.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import www.model.enums.Role;
import www.model.enums.Gender;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;
    
    private String fullName;
    
    private String password;

    // Optional fields - can be null if not provided
    private String phone;

    private String address;

    private Gender gender; // MALE, FEMALE, OTHER

    private String identityNumber;

    @Builder.Default
    private boolean enabled = false;
    
    @Builder.Default
    private Role role = Role.USER;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}