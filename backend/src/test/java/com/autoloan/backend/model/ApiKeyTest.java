package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class ApiKeyTest {

    @Test
    void shouldCreateWithBuilder() {
        ApiKey key = ApiKey.builder()
                .name("Production Key")
                .keyDigest("sha256-digest-here")
                .userId(1L)
                .build();

        assertEquals("Production Key", key.getName());
        assertEquals("sha256-digest-here", key.getKeyDigest());
        assertEquals(1L, key.getUserId());
    }

    @Test
    void shouldDefaultActiveToTrue() {
        ApiKey key = ApiKey.builder()
                .name("Key")
                .keyDigest("digest")
                .userId(1L)
                .build();

        assertTrue(key.isActive());
    }

    @Test
    void shouldSetOptionalFields() {
        ApiKey key = new ApiKey();
        Instant now = Instant.now();
        key.setExpiresAt(now.plusSeconds(86400));
        key.setLastUsedAt(now);

        assertNotNull(key.getExpiresAt());
        assertNotNull(key.getLastUsedAt());
    }
}
