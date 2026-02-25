package com.autoloan.backend.dto.user;

import java.util.Set;

import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import static org.junit.jupiter.api.Assertions.*;

class UserUpdateRequestTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldPassValidation() {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("555-1234");

        Set<ConstraintViolation<UserUpdateRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailWhenFieldsBlank() {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setFirstName("");
        request.setLastName("");
        request.setPhone("");

        Set<ConstraintViolation<UserUpdateRequest>> violations = validator.validate(request);
        assertEquals(3, violations.size());
    }
}
