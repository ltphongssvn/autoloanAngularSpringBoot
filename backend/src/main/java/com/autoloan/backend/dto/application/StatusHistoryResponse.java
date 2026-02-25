package com.autoloan.backend.dto.application;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class StatusHistoryResponse {
    private Long id;
    private String fromStatus;
    private String toStatus;
    private String comment;
    private Long applicationId;
    private Long userId;
    private Instant createdAt;
}
