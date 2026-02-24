package com.autoloan.backend.model;

import com.autoloan.backend.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "encrypted_password", nullable = false)
    private String encryptedPassword;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    @Column(unique = true)
    private String jti;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "confirmation_token", unique = true)
    private String confirmationToken;

    @Column(name = "confirmation_sent_at")
    private Instant confirmationSentAt;

    @Column(name = "reset_password_token", unique = true)
    private String resetPasswordToken;

    @Column(name = "reset_password_sent_at")
    private Instant resetPasswordSentAt;

    @Column(name = "failed_attempts")
    @Builder.Default
    private int failedAttempts = 0;

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Column(name = "unlock_token", unique = true)
    private String unlockToken;

    @Column(name = "sign_in_count")
    @Builder.Default
    private int signInCount = 0;

    @Column(name = "current_sign_in_at")
    private Instant currentSignInAt;

    @Column(name = "last_sign_in_at")
    private Instant lastSignInAt;

    @Column(name = "current_sign_in_ip")
    private String currentSignInIp;

    @Column(name = "last_sign_in_ip")
    private String lastSignInIp;

    @Column(name = "otp_secret")
    private String otpSecret;

    @Column(name = "otp_required_for_login")
    private Boolean otpRequiredForLogin;

    @Column(name = "otp_backup_codes")
    private String otpBackupCodes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ApplicationNote> applicationNotes = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StatusHistory> statusHistories = new ArrayList<>();

    @OneToMany(mappedBy = "verifiedBy")
    @Builder.Default
    private List<Document> verifiedDocuments = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ApiKey> apiKeys = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SecurityAuditLog> securityAuditLogs = new ArrayList<>();
}
