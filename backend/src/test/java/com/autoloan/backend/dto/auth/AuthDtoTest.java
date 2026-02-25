package com.autoloan.backend.dto.auth;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void loginRequestShouldValidate() {
        var req = LoginRequest.builder().email("a@b.com").password("pass1234").build();
        assertTrue(validator.validate(req).isEmpty());
    }

    @Test
    void loginRequestShouldRejectBlankEmail() {
        var req = LoginRequest.builder().email("").password("pass1234").build();
        assertFalse(validator.validate(req).isEmpty());
    }

    @Test
    void loginRequestShouldRejectInvalidEmail() {
        var req = LoginRequest.builder().email("notanemail").password("pass1234").build();
        assertFalse(validator.validate(req).isEmpty());
    }

    @Test
    void signupRequestShouldValidate() {
        var req = SignupRequest.builder()
                .email("a@b.com").password("pass1234")
                .firstName("John").lastName("Doe").phone("555-1234").build();
        assertTrue(validator.validate(req).isEmpty());
    }

    @Test
    void signupRequestShouldRejectShortPassword() {
        var req = SignupRequest.builder()
                .email("a@b.com").password("short")
                .firstName("John").lastName("Doe").phone("555-1234").build();
        assertFalse(validator.validate(req).isEmpty());
    }

    @Test
    void authResponseShouldBuild() {
        var resp = AuthResponse.builder()
                .token("jwt").email("a@b.com").firstName("John")
                .lastName("Doe").role("CUSTOMER").userId(1L).otpRequired(false).build();
        assertEquals("jwt", resp.getToken());
        assertEquals(1L, resp.getUserId());
        assertFalse(resp.isOtpRequired());
    }
}
