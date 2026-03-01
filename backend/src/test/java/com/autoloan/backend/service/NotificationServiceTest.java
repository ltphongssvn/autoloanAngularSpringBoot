// backend/src/test/java/com/autoloan/backend/service/NotificationServiceTest.java
package com.autoloan.backend.service;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(messagingTemplate);
    }

    // ==================== notifyUser ====================

    @Test
    void notifyUserShouldSendToUserQueue() {
        Map<String, Object> data = Map.of("key", "value");

        notificationService.notifyUser(1L, "test_event", data);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate).convertAndSendToUser(eq("1"), eq("/queue/notifications"), captor.capture());

        Map<String, Object> sent = captor.getValue();
        assertEquals("test_event", sent.get("event"));
        assertEquals(data, sent.get("data"));
    }

    // ==================== notifyStatusChange ====================

    @Test
    void notifyStatusChangeShouldSendCorrectPayload() {
        notificationService.notifyStatusChange(1L, 10L, "APP-001", "SUBMITTED", "UNDER_REVIEW");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate).convertAndSendToUser(eq("1"), eq("/queue/notifications"), captor.capture());

        Map<String, Object> sent = captor.getValue();
        assertEquals("status_change", sent.get("event"));
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) sent.get("data");
        assertEquals(10L, data.get("applicationId"));
        assertEquals("APP-001", data.get("applicationNumber"));
        assertEquals("SUBMITTED", data.get("oldStatus"));
        assertEquals("UNDER_REVIEW", data.get("newStatus"));
        assertNotNull(data.get("timestamp"));
    }

    // ==================== notifyDocumentUploaded ====================

    @Test
    void notifyDocumentUploadedShouldSendCorrectPayload() {
        notificationService.notifyDocumentUploaded(2L, 20L, "APP-002", "pay_stub");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate).convertAndSendToUser(eq("2"), eq("/queue/notifications"), captor.capture());

        Map<String, Object> sent = captor.getValue();
        assertEquals("document_uploaded", sent.get("event"));
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) sent.get("data");
        assertEquals(20L, data.get("applicationId"));
        assertEquals("APP-002", data.get("applicationNumber"));
        assertEquals("pay_stub", data.get("docType"));
        assertNotNull(data.get("timestamp"));
    }

    // ==================== notifyApplicationSubmitted ====================

    @Test
    void notifyApplicationSubmittedShouldSendCorrectPayload() {
        notificationService.notifyApplicationSubmitted(3L, 30L, "APP-003");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(messagingTemplate).convertAndSendToUser(eq("3"), eq("/queue/notifications"), captor.capture());

        Map<String, Object> sent = captor.getValue();
        assertEquals("application_submitted", sent.get("event"));
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) sent.get("data");
        assertEquals(30L, data.get("applicationId"));
        assertEquals("APP-003", data.get("applicationNumber"));
        assertNotNull(data.get("timestamp"));
    }
}
