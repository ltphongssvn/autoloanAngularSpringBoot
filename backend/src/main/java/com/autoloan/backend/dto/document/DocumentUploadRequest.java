package com.autoloan.backend.dto.document;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DocumentUploadRequest {
    @NotNull(message = "Document type is required")
    private String docType;
}
