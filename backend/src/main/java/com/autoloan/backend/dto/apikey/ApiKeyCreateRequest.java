// backend/src/main/java/com/autoloan/backend/dto/apikey/ApiKeyCreateRequest.java
package com.autoloan.backend.dto.apikey;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApiKeyCreateRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String expiresAt;
}
