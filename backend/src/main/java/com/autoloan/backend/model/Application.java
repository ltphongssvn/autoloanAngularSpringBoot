package com.autoloan.backend.model;

import com.autoloan.backend.model.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "applications", indexes = {
        @Index(name = "idx_app_user_id", columnList = "user_id"),
        @Index(name = "idx_app_status", columnList = "status"),
        @Index(name = "idx_app_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_number", unique = true)
    private String applicationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(name = "current_step")
    @Builder.Default
    private int currentStep = 1;

    private LocalDate dob;

    @Column(name = "loan_amount", precision = 10, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "down_payment", precision = 10, scale = 2)
    private BigDecimal downPayment;

    @Column(name = "loan_term")
    private Integer loanTerm;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "monthly_payment", precision = 10, scale = 2)
    private BigDecimal monthlyPayment;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "signature_data")
    private String signatureData;

    @Column(name = "signed_at")
    private Instant signedAt;

    @Column(name = "agreement_accepted")
    private Boolean agreementAccepted;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "ssn_encrypted")
    private String ssnEncrypted;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
