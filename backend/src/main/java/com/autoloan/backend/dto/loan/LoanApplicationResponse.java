package com.autoloan.backend.dto.loan;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanApplicationResponse {

    private Long id;
    private String applicationNumber;
    private String status;
    private int currentStep;
    private LocalDate dob;
    private BigDecimal loanAmount;
    private BigDecimal downPayment;
    private Integer loanTerm;
    private BigDecimal interestRate;
    private BigDecimal monthlyPayment;
    private String rejectionReason;
    private Long userId;
    private Instant submittedAt;
    private Instant decidedAt;
    private Instant createdAt;
    private Instant updatedAt;

    private String vehicleMake;
    private String vehicleModel;
    private Integer vehicleYear;
    private String vehicleTrim;
    private String vehicleVin;
}
