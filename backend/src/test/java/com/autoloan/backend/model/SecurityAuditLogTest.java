package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SecurityAuditLogTest {

    @Test
    void shouldCreateWithBuilder() {
        SecurityAuditLog log = SecurityAuditLog.builder()
                .eventType("LOGIN")
                .userId(1L)
                .ipAddress("192.168.1.1")
                .userAgent("Mozilla/5.0")
                .build();
        assertEquals("LOGIN", log.getEventType());
        assertEquals(1L, log.getUserId());
        assertEquals("192.168.1.1", log.getIpAddress());
        assertEquals("Mozilla/5.0", log.getUserAgent());
    }

    @Test
    void shouldDefaultSuccessToFalse() {
        SecurityAuditLog log = SecurityAuditLog.builder()
                .eventType("LOGIN")
                .ipAddress("127.0.0.1")
                .build();
        assertFalse(log.isSuccess());
    }

    @Test
    void shouldSetOptionalFields() {
        SecurityAuditLog log = new SecurityAuditLog();
        log.setResourceType("Application");
        log.setResourceId(42);
        log.setMetadata("{\"action\":\"approve\"}");
        log.setSuccess(false);
        assertEquals("Application", log.getResourceType());
        assertEquals(42, log.getResourceId());
        assertEquals("{\"action\":\"approve\"}", log.getMetadata());
        assertFalse(log.isSuccess());
    }
}
