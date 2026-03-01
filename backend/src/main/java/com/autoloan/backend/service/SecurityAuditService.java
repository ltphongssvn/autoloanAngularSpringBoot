// backend/src/main/java/com/autoloan/backend/service/SecurityAuditService.java
package com.autoloan.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.autoloan.backend.model.SecurityAuditLog;
import com.autoloan.backend.repository.SecurityAuditLogRepository;

@Service
public class SecurityAuditService {

    private static final Logger logger = LoggerFactory.getLogger(SecurityAuditService.class);

    private final SecurityAuditLogRepository repository;

    public SecurityAuditService(SecurityAuditLogRepository repository) {
        this.repository = repository;
    }

    public SecurityAuditLog logEvent(String eventType, String ipAddress, Long userId,
                                      String userAgent, String resourceType, Integer resourceId,
                                      String metadata, Boolean success) {
        try {
            SecurityAuditLog log = SecurityAuditLog.builder()
                    .eventType(eventType)
                    .ipAddress(ipAddress)
                    .userId(userId)
                    .userAgent(userAgent)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .metadata(metadata)
                    .success(success != null ? success : true)
                    .build();
            return repository.save(log);
        } catch (Exception e) {
            logger.error("Failed to log security event: {}", e.getMessage());
            return null;
        }
    }

    public long failedLoginsForIp(String ipAddress, Instant since) {
        Instant sinceDate = since != null ? since : Instant.now().minus(15, ChronoUnit.MINUTES);
        return repository.countByEventTypeAndIpAddressAndCreatedAtAfter("login_failure", ipAddress, sinceDate);
    }

    public long failedLoginsForUser(Long userId, Instant since) {
        Instant sinceDate = since != null ? since : Instant.now().minus(15, ChronoUnit.MINUTES);
        return repository.countByEventTypeAndUserIdAndCreatedAtAfter("login_failure", userId, sinceDate);
    }

    public List<SecurityAuditLog> findByUser(Long userId, int limit) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit));
    }

    public List<SecurityAuditLog> findByEventType(String eventType, int limit) {
        return repository.findByEventTypeOrderByCreatedAtDesc(eventType, PageRequest.of(0, limit));
    }

    public List<SecurityAuditLog> findRecent(int limit) {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }
}
