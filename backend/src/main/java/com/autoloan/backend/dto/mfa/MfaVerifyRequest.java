// backend/src/main/java/com/autoloan/backend/dto/mfa/MfaVerifyRequest.java
package com.autoloan.backend.dto.mfa;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MfaVerifyRequest {
    @NotBlank(message = "Verification code is required")
    private String code;
}
