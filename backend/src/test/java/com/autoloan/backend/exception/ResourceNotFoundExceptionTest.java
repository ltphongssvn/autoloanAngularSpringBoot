package com.autoloan.backend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void shouldCreateWithMessage() {
        var ex = new ResourceNotFoundException("not found");
        assertEquals("not found", ex.getMessage());
        assertInstanceOf(RuntimeException.class, ex);
    }
}
