package com.autoloan.backend.model.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationStatusTest {

    @Test
    void shouldHaveSevenStatuses() {
        assertEquals(7, ApplicationStatus.values().length);
    }

    @Test
    void shouldContainExpectedValues() {
        assertNotNull(ApplicationStatus.valueOf("DRAFT"));
        assertNotNull(ApplicationStatus.valueOf("SUBMITTED"));
        assertNotNull(ApplicationStatus.valueOf("UNDER_REVIEW"));
        assertNotNull(ApplicationStatus.valueOf("PENDING_DOCUMENTS"));
        assertNotNull(ApplicationStatus.valueOf("APPROVED"));
        assertNotNull(ApplicationStatus.valueOf("REJECTED"));
        assertNotNull(ApplicationStatus.valueOf("SIGNED"));
    }
}
