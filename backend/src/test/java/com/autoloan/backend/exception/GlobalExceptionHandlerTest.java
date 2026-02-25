package com.autoloan.backend.exception;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

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
}
