package com.autoloan.backend.dto.loan;

import java.math.BigDecimal;
import java.util.Set;

import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import static org.junit.jupiter.api.Assertions.*;

class LoanApplicationRequestTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldPassValidation() {
        LoanApplicationRequest request = new LoanApplicationRequest();
        request.setLoanAmount(new BigDecimal("25000.00"));
        request.setDownPayment(new BigDecimal("5000.00"));
        request.setLoanTerm(36);
        request.setVehicleMake("Toyota");
        request.setVehicleModel("Camry");
        request.setVehicleYear(2024);

        Set<ConstraintViolation<LoanApplicationRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailWhenRequiredFieldsMissing() {
        LoanApplicationRequest request = new LoanApplicationRequest();

        Set<ConstraintViolation<LoanApplicationRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.size() >= 5);
    }

    @Test
    void shouldFailWhenLoanAmountTooLow() {
        LoanApplicationRequest request = new LoanApplicationRequest();
        request.setLoanAmount(new BigDecimal("500.00"));
        request.setDownPayment(new BigDecimal("0.00"));
        request.setLoanTerm(36);
        request.setVehicleMake("Toyota");
        request.setVehicleModel("Camry");
        request.setVehicleYear(2024);

        Set<ConstraintViolation<LoanApplicationRequest>> violations = validator.validate(request);
        assertEquals(1, violations.size());
    }
}
