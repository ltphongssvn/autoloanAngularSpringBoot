package com.autoloan.backend.dto.document;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class DocumentUploadRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidRequest() {
        DocumentUploadRequest request = new DocumentUploadRequest();
        request.setDocType("DRIVERS_LICENSE");
        Set<ConstraintViolation<DocumentUploadRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testNullDocType() {
        DocumentUploadRequest request = new DocumentUploadRequest();
        Set<ConstraintViolation<DocumentUploadRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertEquals("Document type is required", violations.iterator().next().getMessage());
    }
}
