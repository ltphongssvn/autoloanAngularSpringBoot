package com.autoloan.backend.dto.document;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DocumentStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private String status;
    private String rejectionNote;
}
