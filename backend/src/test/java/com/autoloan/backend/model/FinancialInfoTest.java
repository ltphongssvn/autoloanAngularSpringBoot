package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FinancialInfoTest {

    @Test
    void shouldCreateWithBuilder() {
        FinancialInfo fi = FinancialInfo.builder()
                .annualIncome(new BigDecimal("75000.00"))
                .monthlyIncome(new BigDecimal("6250.00"))
                .employerName("Acme Corp")
                .jobTitle("Engineer")
                .creditScore(720)
                .applicationId(1L)
                .build();

        assertEquals(new BigDecimal("75000.00"), fi.getAnnualIncome());
        assertEquals(new BigDecimal("6250.00"), fi.getMonthlyIncome());
        assertEquals("Acme Corp", fi.getEmployerName());
        assertEquals("Engineer", fi.getJobTitle());
        assertEquals(720, fi.getCreditScore());
        assertEquals(1L, fi.getApplicationId());
    }

    @Test
    void shouldSetOptionalFields() {
        FinancialInfo fi = new FinancialInfo();
        fi.setEmploymentStatus("full_time");
        fi.setIncomeType("salary");
        fi.setYearsEmployed(5);
        fi.setMonthsEmployed(3);
        fi.setMonthlyExpenses(new BigDecimal("2000.00"));
        fi.setOtherIncome(new BigDecimal("500.00"));

        assertEquals("full_time", fi.getEmploymentStatus());
        assertEquals("salary", fi.getIncomeType());
        assertEquals(5, fi.getYearsEmployed());
        assertEquals(3, fi.getMonthsEmployed());
        assertEquals(new BigDecimal("2000.00"), fi.getMonthlyExpenses());
        assertEquals(new BigDecimal("500.00"), fi.getOtherIncome());
    }
}
