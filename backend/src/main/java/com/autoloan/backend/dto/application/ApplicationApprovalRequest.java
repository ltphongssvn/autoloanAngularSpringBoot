package com.autoloan.backend.dto.application;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ApplicationApprovalRequest {
    private Integer loanTerm;
    private BigDecimal interestRate;
    private BigDecimal monthlyPayment;
}
