// backend/src/main/java/com/autoloan/backend/dto/mfa/MfaEnableResponse.java
package com.autoloan.backend.dto.mfa;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MfaEnableResponse {
    private boolean mfaEnabled;
    private List<String> backupCodes;
}
