package com.autoloan.backend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AccountLockedExceptionTest {

    @Test
    void shouldCreateWithMessage() {
        var ex = new AccountLockedException("locked");
        assertEquals("locked", ex.getMessage());
        assertInstanceOf(RuntimeException.class, ex);
    }
}
