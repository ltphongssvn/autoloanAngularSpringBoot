package com.autoloan.backend.exception;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void shouldHandleBadRequest() {
        ResponseEntity<Map<String, Object>> response = handler.handleBadRequest(new BadRequestException("bad"));
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode().value());
        assertEquals("bad", response.getBody().get("message"));
        assertEquals(400, response.getBody().get("status"));
        assertNotNull(response.getBody().get("timestamp"));
        assertEquals("Bad Request", response.getBody().get("error"));
    }

    @Test
    void shouldHandleUnauthorized() {
        ResponseEntity<Map<String, Object>> response = handler.handleUnauthorized(new UnauthorizedException("denied"));
        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatusCode().value());
        assertEquals("denied", response.getBody().get("message"));
        assertEquals(401, response.getBody().get("status"));
    }

    @Test
    void shouldHandleAccountLocked() {
        ResponseEntity<Map<String, Object>> response = handler.handleAccountLocked(new AccountLockedException("locked"));
        assertEquals(HttpStatus.LOCKED.value(), response.getStatusCode().value());
        assertEquals("locked", response.getBody().get("message"));
        assertEquals(423, response.getBody().get("status"));
    }

    @Test
    void shouldHandleNotFound() {
        ResponseEntity<Map<String, Object>> response = handler.handleNotFound(new ResourceNotFoundException("missing"));
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode().value());
        assertEquals("missing", response.getBody().get("message"));
        assertEquals(404, response.getBody().get("status"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldHandleValidationErrors() {
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError1 = new FieldError("obj", "email", "must not be blank");
        FieldError fieldError2 = new FieldError("obj", "password", "size must be between 8 and 100");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidation(ex);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode().value());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("Validation Failed", response.getBody().get("error"));
        assertNotNull(response.getBody().get("timestamp"));

        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertEquals("must not be blank", errors.get("email"));
        assertEquals("size must be between 8 and 100", errors.get("password"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void shouldHandleValidationWithEmptyErrors() {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of());

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidation(ex);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode().value());

        Map<String, String> errors = (Map<String, String>) response.getBody().get("errors");
        assertTrue(errors.isEmpty());
    }
}
