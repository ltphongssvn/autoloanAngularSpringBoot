package com.autoloan.backend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BadRequestExceptionTest {

    @Test
    void shouldCreateWithMessage() {
        var ex = new BadRequestException("test error");
        assertEquals("test error", ex.getMessage());
        assertInstanceOf(RuntimeException.class, ex);
    }
}
