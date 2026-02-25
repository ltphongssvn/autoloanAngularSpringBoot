package com.autoloan.backend.dto.document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class DocumentResponse {
    private Long id;
    private String docType;
    private String fileName;
    private String fileUrl;
    private Integer fileSize;
    private String contentType;
    private String status;
    private String requestNote;
    private String rejectionNote;
    private Instant uploadedAt;
    private Instant verifiedAt;
    private Long verifiedById;
    private Long applicationId;
    private Instant createdAt;
    private Instant updatedAt;
}
