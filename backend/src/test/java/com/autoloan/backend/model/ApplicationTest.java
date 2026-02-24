package com.autoloan.backend.model;

import com.autoloan.backend.model.enums.ApplicationStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationTest {

    @Test
    void shouldCreateWithBuilder() {
        Application app = Application.builder()
                .userId(1L)
                .loanAmount(new BigDecimal("25000.00"))
                .downPayment(new BigDecimal("5000.00"))
                .loanTerm(60)
                .build();

        assertEquals(1L, app.getUserId());
        assertEquals(new BigDecimal("25000.00"), app.getLoanAmount());
        assertEquals(new BigDecimal("5000.00"), app.getDownPayment());
        assertEquals(60, app.getLoanTerm());
    }

    @Test
    void shouldDefaultStatusToDraft() {
        Application app = Application.builder().userId(1L).build();
        assertEquals(ApplicationStatus.DRAFT, app.getStatus());
    }

    @Test
    void shouldDefaultCurrentStepToOne() {
        Application app = Application.builder().userId(1L).build();
        assertEquals(1, app.getCurrentStep());
    }

    @Test
    void shouldSetAndGetFields() {
        Application app = new Application();
        app.setApplicationNumber("APP-001");
        app.setStatus(ApplicationStatus.SUBMITTED);
        app.setSsnEncrypted("encrypted-ssn");

        assertEquals("APP-001", app.getApplicationNumber());
        assertEquals(ApplicationStatus.SUBMITTED, app.getStatus());
        assertEquals("encrypted-ssn", app.getSsnEncrypted());
    }
}
