// backend/src/main/java/com/autoloan/backend/dto/apikey/ApiKeyResponse.java
package com.autoloan.backend.dto.apikey;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKeyResponse {
    private Long id;
    private String name;
    private String key;
    private boolean active;
    private Instant expiresAt;
    private Instant lastUsedAt;
    private Instant createdAt;
}
