package com.autoloan.backend.dto.note;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class NoteResponse {
    private Long id;
    private String note;
    private Boolean internal;
    private Long applicationId;
    private Long userId;
    private Instant createdAt;
    private Instant updatedAt;
}
