package com.autoloan.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "jwt_denylists", indexes = {
        @Index(name = "idx_jwt_jti", columnList = "jti")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtDenylist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jti;

    private Instant exp;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
