package www.model.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}