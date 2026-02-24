package com.autoloan.backend.model;

import com.autoloan.backend.model.enums.DocumentStatus;
import com.autoloan.backend.model.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "documents", indexes = {
        @Index(name = "idx_doc_app_id", columnList = "application_id"),
        @Index(name = "idx_doc_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false)
    @Builder.Default
    private DocumentType docType = DocumentType.OTHER;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_size")
    private Integer fileSize;

    @Column(name = "content_type")
    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DocumentStatus status = DocumentStatus.REQUESTED;

    @Column(name = "request_note")
    private String requestNote;

    @Column(name = "rejection_note")
    private String rejectionNote;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by_id")
    private Long verifiedById;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
