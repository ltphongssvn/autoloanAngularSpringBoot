package com.autoloan.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "financial_infos", indexes = {
        @Index(name = "idx_fin_app_id", columnList = "application_id"),
        @Index(name = "idx_fin_app_income_type", columnList = "application_id, income_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "annual_income", precision = 12, scale = 2)
    private BigDecimal annualIncome;

    @Column(name = "monthly_income", precision = 10, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(name = "monthly_expenses", precision = 10, scale = 2)
    private BigDecimal monthlyExpenses;

    @Column(name = "other_income", precision = 10, scale = 2)
    private BigDecimal otherIncome;

    @Column(name = "employer_name")
    private String employerName;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "employment_status")
    private String employmentStatus;

    @Column(name = "income_type")
    private String incomeType;

    @Column(name = "years_employed")
    private Integer yearsEmployed;

    @Column(name = "months_employed")
    private Integer monthsEmployed;

    @Column(name = "credit_score")
    private Integer creditScore;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
