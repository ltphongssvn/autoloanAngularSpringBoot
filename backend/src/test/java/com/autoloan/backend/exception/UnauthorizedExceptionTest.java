package com.autoloan.backend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UnauthorizedExceptionTest {

    @Test
    void shouldCreateWithMessage() {
        var ex = new UnauthorizedException("bad creds");
        assertEquals("bad creds", ex.getMessage());
        assertInstanceOf(RuntimeException.class, ex);
    }
}
