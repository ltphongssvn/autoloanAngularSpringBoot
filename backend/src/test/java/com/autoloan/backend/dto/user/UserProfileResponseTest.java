package com.autoloan.backend.dto.user;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserProfileResponseTest {

    @Test
    void shouldSetAndGetAllFields() {
        UserProfileResponse response = new UserProfileResponse();
        Instant now = Instant.now();

        response.setId(1L);
        response.setEmail("test@example.com");
        response.setFirstName("John");
        response.setLastName("Doe");
        response.setPhone("555-1234");
        response.setRole("CUSTOMER");
        response.setConfirmedAt(now);
        response.setCurrentSignInAt(now);
        response.setLastSignInAt(now);
        response.setSignInCount(5);
        response.setCreatedAt(now);

        assertEquals(1L, response.getId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("555-1234", response.getPhone());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals(now, response.getConfirmedAt());
        assertEquals(now, response.getCurrentSignInAt());
        assertEquals(now, response.getLastSignInAt());
        assertEquals(5, response.getSignInCount());
        assertEquals(now, response.getCreatedAt());
    }
}
