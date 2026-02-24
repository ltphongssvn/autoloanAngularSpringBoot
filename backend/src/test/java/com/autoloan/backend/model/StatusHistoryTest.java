package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StatusHistoryTest {

    @Test
    void shouldCreateWithBuilder() {
        StatusHistory sh = StatusHistory.builder()
                .fromStatus("DRAFT")
                .toStatus("SUBMITTED")
                .comment("Application submitted by customer")
                .applicationId(1L)
                .userId(2L)
                .build();

        assertEquals("DRAFT", sh.getFromStatus());
        assertEquals("SUBMITTED", sh.getToStatus());
        assertEquals("Application submitted by customer", sh.getComment());
        assertEquals(1L, sh.getApplicationId());
        assertEquals(2L, sh.getUserId());
    }

    @Test
    void shouldAllowNullOptionalFields() {
        StatusHistory sh = StatusHistory.builder()
                .applicationId(1L)
                .userId(2L)
                .build();

        assertNull(sh.getFromStatus());
        assertNull(sh.getToStatus());
        assertNull(sh.getComment());
    }
}
