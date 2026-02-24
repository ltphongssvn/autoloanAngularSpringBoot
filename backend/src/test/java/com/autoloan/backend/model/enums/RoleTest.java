package com.autoloan.backend.model.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RoleTest {

    @Test
    void shouldHaveThreeRoles() {
        assertEquals(3, Role.values().length);
    }

    @Test
    void shouldContainExpectedValues() {
        assertNotNull(Role.valueOf("CUSTOMER"));
        assertNotNull(Role.valueOf("LOAN_OFFICER"));
        assertNotNull(Role.valueOf("UNDERWRITER"));
    }
}
