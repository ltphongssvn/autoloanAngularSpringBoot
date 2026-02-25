// backend/src/main/java/com/autoloan/backend/dto/mfa/MfaVerifyResponse.java
package com.autoloan.backend.dto.mfa;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MfaVerifyResponse {
    private boolean valid;
    private boolean backupCodeUsed;
}
