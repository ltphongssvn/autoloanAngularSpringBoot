package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class JwtDenylistTest {

    @Test
    void shouldCreateWithBuilder() {
        Instant expiry = Instant.now().plusSeconds(3600);
        JwtDenylist jwt = JwtDenylist.builder()
                .jti("abc-123-def")
                .exp(expiry)
                .build();

        assertEquals("abc-123-def", jwt.getJti());
        assertEquals(expiry, jwt.getExp());
    }

    @Test
    void shouldAllowNullFields() {
        JwtDenylist jwt = JwtDenylist.builder().build();
        assertNull(jwt.getJti());
        assertNull(jwt.getExp());
    }
}
