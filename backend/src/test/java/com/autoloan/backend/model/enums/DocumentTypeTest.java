package com.autoloan.backend.model.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DocumentTypeTest {

    @Test
    void shouldHaveSevenTypes() {
        assertEquals(7, DocumentType.values().length);
    }

    @Test
    void shouldContainExpectedValues() {
        assertNotNull(DocumentType.valueOf("DRIVERS_LICENSE"));
        assertNotNull(DocumentType.valueOf("PAY_STUB"));
        assertNotNull(DocumentType.valueOf("BANK_STATEMENT"));
        assertNotNull(DocumentType.valueOf("TAX_RETURN"));
        assertNotNull(DocumentType.valueOf("PROOF_OF_INSURANCE"));
        assertNotNull(DocumentType.valueOf("PROOF_OF_RESIDENCE"));
        assertNotNull(DocumentType.valueOf("OTHER"));
    }
}
