package com.autoloan.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        // 256-bit secret (32+ chars) required for HS256
        String secret = "test-secret-key-that-is-at-least-32-characters-long"; // pragma: allowlist secret
        long expirationMs = 604800000L; // 7 days
        jwtTokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    void shouldGenerateToken() {
        String token = jwtTokenProvider.generateToken(1L, "user@example.com", "CUSTOMER");
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void shouldExtractUserIdFromToken() {
        String token = jwtTokenProvider.generateToken(42L, "user@example.com", "CUSTOMER");
        assertEquals(42L, jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    void shouldExtractEmailFromToken() {
        String token = jwtTokenProvider.generateToken(1L, "user@example.com", "CUSTOMER");
        assertEquals("user@example.com", jwtTokenProvider.getEmailFromToken(token));
    }

    @Test
    void shouldExtractRoleFromToken() {
        String token = jwtTokenProvider.generateToken(1L, "user@example.com", "LOAN_OFFICER");
        assertEquals("LOAN_OFFICER", jwtTokenProvider.getRoleFromToken(token));
    }

    @Test
    void shouldExtractJtiFromToken() {
        String token = jwtTokenProvider.generateToken(1L, "user@example.com", "CUSTOMER");
        String jti = jwtTokenProvider.getJtiFromToken(token);
        assertNotNull(jti);
        assertFalse(jti.isEmpty());
    }

    @Test
    void shouldValidateValidToken() {
        String token = jwtTokenProvider.generateToken(1L, "user@example.com", "CUSTOMER");
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void shouldRejectInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }

    @Test
    void shouldRejectNullToken() {
        assertFalse(jwtTokenProvider.validateToken(null));
    }

    @Test
    void shouldRejectTokenWithWrongKey() {
        JwtTokenProvider otherProvider = new JwtTokenProvider(
                "different-secret-key-that-is-at-least-32-chars", 604800000L); // pragma: allowlist secret
        String token = otherProvider.generateToken(1L, "user@example.com", "CUSTOMER");
        assertFalse(jwtTokenProvider.validateToken(token));
    }
}
