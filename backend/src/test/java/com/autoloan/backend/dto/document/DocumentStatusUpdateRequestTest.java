package com.autoloan.backend.dto.document;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DocumentStatusUpdateRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidRequest() {
        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        request.setStatus("VERIFIED");
        request.setRejectionNote(null);
        Set<ConstraintViolation<DocumentStatusUpdateRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testNullStatus() {
        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        Set<ConstraintViolation<DocumentStatusUpdateRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertEquals("Status is required", violations.iterator().next().getMessage());
    }

    @Test
    void testWithRejectionNote() {
        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        request.setStatus("REJECTED");
        request.setRejectionNote("Document is blurry");
        assertEquals("REJECTED", request.getStatus());
        assertEquals("Document is blurry", request.getRejectionNote());
    }
}
