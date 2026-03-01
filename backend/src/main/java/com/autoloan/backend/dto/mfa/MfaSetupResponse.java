// backend/src/main/java/com/autoloan/backend/dto/mfa/MfaSetupResponse.java
package com.autoloan.backend.dto.mfa;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MfaSetupResponse {
    private String secret;
    private String otpAuthUrl;
    private String qrCodeSvg;
}
