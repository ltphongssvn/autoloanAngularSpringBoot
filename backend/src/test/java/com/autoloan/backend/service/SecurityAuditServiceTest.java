// backend/src/test/java/com/autoloan/backend/service/SecurityAuditServiceTest.java
package com.autoloan.backend.service;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import com.autoloan.backend.model.SecurityAuditLog;
import com.autoloan.backend.repository.SecurityAuditLogRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityAuditServiceTest {

    @Mock
    private SecurityAuditLogRepository repository;

    private SecurityAuditService service;

    @BeforeEach
    void setUp() {
        service = new SecurityAuditService(repository);
    }

    // ==================== logEvent ====================

    @Test
    void logEventShouldSaveAndReturnLog() {
        SecurityAuditLog saved = SecurityAuditLog.builder()
                .id(1L).eventType("login_success").ipAddress("127.0.0.1").success(true).build();
        when(repository.save(any(SecurityAuditLog.class))).thenReturn(saved);

        SecurityAuditLog result = service.logEvent("login_success", "127.0.0.1", 1L,
                "Mozilla/5.0", "user", 1, "{\"key\":\"value\"}", true);

        assertNotNull(result);
        assertEquals("login_success", result.getEventType());
        verify(repository).save(any(SecurityAuditLog.class));
    }

    @Test
    void logEventShouldDefaultSuccessToTrue() {
        when(repository.save(any(SecurityAuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        SecurityAuditLog result = service.logEvent("login_success", "127.0.0.1", null,
                null, null, null, null, null);

        assertNotNull(result);
        assertTrue(result.isSuccess());
    }

    @Test
    void logEventShouldSetSuccessFalseWhenProvided() {
        when(repository.save(any(SecurityAuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        SecurityAuditLog result = service.logEvent("login_failure", "127.0.0.1", 1L,
                null, null, null, null, false);

        assertNotNull(result);
        assertFalse(result.isSuccess());
    }

    @Test
    void logEventShouldReturnNullOnException() {
        when(repository.save(any(SecurityAuditLog.class))).thenThrow(new RuntimeException("DB error"));

        SecurityAuditLog result = service.logEvent("login_success", "127.0.0.1", 1L,
                null, null, null, null, true);

        assertNull(result);
    }

    @Test
    void logEventShouldHandleNullOptionalFields() {
        when(repository.save(any(SecurityAuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

        SecurityAuditLog result = service.logEvent("logout", "10.0.0.1", null,
                null, null, null, null, true);

        assertNotNull(result);
        assertEquals("logout", result.getEventType());
        assertEquals("10.0.0.1", result.getIpAddress());
        assertNull(result.getUserId());
    }

    // ==================== failedLoginsForIp ====================

    @Test
    void failedLoginsForIpShouldReturnCount() {
        Instant since = Instant.now().minusSeconds(900);
        when(repository.countByEventTypeAndIpAddressAndCreatedAtAfter("login_failure", "127.0.0.1", since))
                .thenReturn(3L);

        long count = service.failedLoginsForIp("127.0.0.1", since);

        assertEquals(3L, count);
    }

    @Test
    void failedLoginsForIpShouldUseDefaultSinceWhenNull() {
        when(repository.countByEventTypeAndIpAddressAndCreatedAtAfter(eq("login_failure"), eq("127.0.0.1"), any(Instant.class)))
                .thenReturn(5L);

        long count = service.failedLoginsForIp("127.0.0.1", null);

        assertEquals(5L, count);
        verify(repository).countByEventTypeAndIpAddressAndCreatedAtAfter(eq("login_failure"), eq("127.0.0.1"), any(Instant.class));
    }

    // ==================== failedLoginsForUser ====================

    @Test
    void failedLoginsForUserShouldReturnCount() {
        Instant since = Instant.now().minusSeconds(900);
        when(repository.countByEventTypeAndUserIdAndCreatedAtAfter("login_failure", 1L, since))
                .thenReturn(2L);

        long count = service.failedLoginsForUser(1L, since);

        assertEquals(2L, count);
    }

    @Test
    void failedLoginsForUserShouldUseDefaultSinceWhenNull() {
        when(repository.countByEventTypeAndUserIdAndCreatedAtAfter(eq("login_failure"), eq(1L), any(Instant.class)))
                .thenReturn(4L);

        long count = service.failedLoginsForUser(1L, null);

        assertEquals(4L, count);
    }

    // ==================== findByUser ====================

    @Test
    void findByUserShouldReturnLogs() {
        List<SecurityAuditLog> logs = List.of(
                SecurityAuditLog.builder().id(1L).eventType("login_success").ipAddress("127.0.0.1").success(true).build());
        when(repository.findByUserIdOrderByCreatedAtDesc(eq(1L), any(PageRequest.class))).thenReturn(logs);

        List<SecurityAuditLog> result = service.findByUser(1L, 20);

        assertEquals(1, result.size());
    }

    // ==================== findByEventType ====================

    @Test
    void findByEventTypeShouldReturnLogs() {
        List<SecurityAuditLog> logs = List.of(
                SecurityAuditLog.builder().id(1L).eventType("login_failure").ipAddress("127.0.0.1").success(false).build());
        when(repository.findByEventTypeOrderByCreatedAtDesc(eq("login_failure"), any(PageRequest.class))).thenReturn(logs);

        List<SecurityAuditLog> result = service.findByEventType("login_failure", 20);

        assertEquals(1, result.size());
        assertEquals("login_failure", result.get(0).getEventType());
    }

    // ==================== findRecent ====================

    @Test
    void findRecentShouldReturnLogs() {
        List<SecurityAuditLog> logs = List.of(
                SecurityAuditLog.builder().id(1L).eventType("logout").ipAddress("127.0.0.1").success(true).build(),
                SecurityAuditLog.builder().id(2L).eventType("login_success").ipAddress("10.0.0.1").success(true).build());
        when(repository.findAllByOrderByCreatedAtDesc(any(PageRequest.class))).thenReturn(logs);

        List<SecurityAuditLog> result = service.findRecent(50);

        assertEquals(2, result.size());
    }
}
