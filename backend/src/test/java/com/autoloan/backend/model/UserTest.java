package com.autoloan.backend.model;

import com.autoloan.backend.model.enums.Role;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void shouldCreateUserWithBuilder() {
        User user = User.builder()
                .email("test@example.com")
                .encryptedPassword("hashed")
                .firstName("John")
                .lastName("Doe")
                .phone("555-1234")
                .build();

        assertEquals("test@example.com", user.getEmail());
        assertEquals("hashed", user.getEncryptedPassword());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertEquals("555-1234", user.getPhone());
    }

    @Test
    void shouldDefaultRoleToCustomer() {
        User user = User.builder()
                .email("test@example.com")
                .encryptedPassword("hashed")
                .firstName("John")
                .lastName("Doe")
                .phone("555-1234")
                .build();

        assertEquals(Role.CUSTOMER, user.getRole());
    }

    @Test
    void shouldDefaultFailedAttemptsAndSignInCountToZero() {
        User user = User.builder()
                .email("test@example.com")
                .encryptedPassword("hashed")
                .firstName("John")
                .lastName("Doe")
                .phone("555-1234")
                .build();

        assertEquals(0, user.getFailedAttempts());
        assertEquals(0, user.getSignInCount());
    }

    @Test
    void shouldSetAndGetAllFields() {
        User user = new User();
        user.setEmail("admin@example.com");
        user.setRole(Role.LOAN_OFFICER);
        user.setOtpRequiredForLogin(true);
        user.setJti("some-jti");
        user.setUnlockToken("token123");

        assertEquals("admin@example.com", user.getEmail());
        assertEquals(Role.LOAN_OFFICER, user.getRole());
        assertTrue(user.getOtpRequiredForLogin());
        assertEquals("some-jti", user.getJti());
        assertEquals("token123", user.getUnlockToken());
    }
}
