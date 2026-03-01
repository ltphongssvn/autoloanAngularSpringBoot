// backend/src/main/java/com/autoloan/backend/dto/mfa/MfaStatusResponse.java
package com.autoloan.backend.dto.mfa;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MfaStatusResponse {
    private boolean mfaEnabled;
}
