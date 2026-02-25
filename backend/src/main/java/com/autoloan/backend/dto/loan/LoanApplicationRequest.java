package com.autoloan.backend.dto.loan;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoanApplicationRequest {

    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "1000.00", message = "Loan amount must be at least 1000")
    private BigDecimal loanAmount;

    @NotNull(message = "Down payment is required")
    @DecimalMin(value = "0.00", message = "Down payment cannot be negative")
    private BigDecimal downPayment;

    @NotNull(message = "Loan term is required")
    @Min(value = 6, message = "Loan term must be at least 6 months")
    private Integer loanTerm;

    private LocalDate dob;

    @NotBlank(message = "Vehicle make is required")
    private String vehicleMake;

    @NotBlank(message = "Vehicle model is required")
    private String vehicleModel;

    @NotNull(message = "Vehicle year is required")
    @Min(value = 1900, message = "Vehicle year must be valid")
    private Integer vehicleYear;

    private String vehicleTrim;
    private String vehicleVin;
    private Integer vehicleMileage;
    private String vehicleCondition;
    private BigDecimal vehicleEstimatedValue;
}
