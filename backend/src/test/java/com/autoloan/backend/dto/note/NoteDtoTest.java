package com.autoloan.backend.dto.note;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class NoteDtoTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void noteResponse_gettersSetters() {
        NoteResponse response = new NoteResponse();
        Instant now = Instant.now();
        response.setId(1L);
        response.setNote("Test note");
        response.setInternal(true);
        response.setApplicationId(10L);
        response.setUserId(100L);
        response.setCreatedAt(now);
        response.setUpdatedAt(now);

        assertEquals(1L, response.getId());
        assertEquals("Test note", response.getNote());
        assertTrue(response.getInternal());
        assertEquals(10L, response.getApplicationId());
        assertEquals(100L, response.getUserId());
        assertEquals(now, response.getCreatedAt());
        assertEquals(now, response.getUpdatedAt());
    }

    @Test
    void noteCreateRequest_valid() {
        NoteCreateRequest request = new NoteCreateRequest();
        request.setNote("Some note");
        request.setInternal(false);
        Set<ConstraintViolation<NoteCreateRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void noteCreateRequest_blankNote() {
        NoteCreateRequest request = new NoteCreateRequest();
        request.setNote("");
        Set<ConstraintViolation<NoteCreateRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertEquals("Note content is required", violations.iterator().next().getMessage());
    }

    @Test
    void noteCreateRequest_nullNote() {
        NoteCreateRequest request = new NoteCreateRequest();
        Set<ConstraintViolation<NoteCreateRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
    }
}
