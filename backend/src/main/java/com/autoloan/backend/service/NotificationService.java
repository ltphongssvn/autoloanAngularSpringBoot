// backend/src/main/java/com/autoloan/backend/service/NotificationService.java
package com.autoloan.backend.service;

import java.time.Instant;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyUser(Long userId, String event, Map<String, Object> data) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                Map.of("event", event, "data", data)
        );
    }

    public void notifyStatusChange(Long userId, Long applicationId, String applicationNumber,
                                    String oldStatus, String newStatus) {
        notifyUser(userId, "status_change", Map.of(
                "applicationId", applicationId,
                "applicationNumber", applicationNumber,
                "oldStatus", oldStatus,
                "newStatus", newStatus,
                "timestamp", Instant.now().toString()
        ));
    }

    public void notifyDocumentUploaded(Long userId, Long applicationId, String applicationNumber,
                                        String docType) {
        notifyUser(userId, "document_uploaded", Map.of(
                "applicationId", applicationId,
                "applicationNumber", applicationNumber,
                "docType", docType,
                "timestamp", Instant.now().toString()
        ));
    }

    public void notifyApplicationSubmitted(Long userId, Long applicationId, String applicationNumber) {
        notifyUser(userId, "application_submitted", Map.of(
                "applicationId", applicationId,
                "applicationNumber", applicationNumber,
                "timestamp", Instant.now().toString()
        ));
    }
}
