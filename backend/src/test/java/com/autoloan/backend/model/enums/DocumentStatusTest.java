package com.autoloan.backend.model.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DocumentStatusTest {

    @Test
    void shouldHaveFourStatuses() {
        assertEquals(4, DocumentStatus.values().length);
    }

    @Test
    void shouldContainExpectedValues() {
        assertNotNull(DocumentStatus.valueOf("REQUESTED"));
        assertNotNull(DocumentStatus.valueOf("UPLOADED"));
        assertNotNull(DocumentStatus.valueOf("VERIFIED"));
        assertNotNull(DocumentStatus.valueOf("REJECTED"));
    }
}
