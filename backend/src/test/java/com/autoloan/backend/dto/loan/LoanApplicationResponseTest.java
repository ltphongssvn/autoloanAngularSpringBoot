package com.autoloan.backend.dto.loan;

import java.math.BigDecimal;
import java.time.Instant;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class LoanApplicationResponseTest {

    @Test
    void shouldSetAndGetAllFields() {
        LoanApplicationResponse response = new LoanApplicationResponse();
        Instant now = Instant.now();

        response.setId(1L);
        response.setApplicationNumber("APP-001");
        response.setStatus("DRAFT");
        response.setCurrentStep(1);
        response.setLoanAmount(new BigDecimal("25000.00"));
        response.setDownPayment(new BigDecimal("5000.00"));
        response.setLoanTerm(36);
        response.setInterestRate(new BigDecimal("5.99"));
        response.setMonthlyPayment(new BigDecimal("608.29"));
        response.setUserId(1L);
        response.setCreatedAt(now);
        response.setUpdatedAt(now);
        response.setVehicleMake("Toyota");
        response.setVehicleModel("Camry");
        response.setVehicleYear(2024);

        assertEquals(1L, response.getId());
        assertEquals("APP-001", response.getApplicationNumber());
        assertEquals("DRAFT", response.getStatus());
        assertEquals(new BigDecimal("25000.00"), response.getLoanAmount());
        assertEquals("Toyota", response.getVehicleMake());
        assertEquals(2024, response.getVehicleYear());
    }
}
