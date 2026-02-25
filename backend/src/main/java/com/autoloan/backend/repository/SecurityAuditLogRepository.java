// backend/src/main/java/com/autoloan/backend/repository/SecurityAuditLogRepository.java
package com.autoloan.backend.repository;

import com.autoloan.backend.model.SecurityAuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {
    List<SecurityAuditLog> findByUserId(Long userId);
    List<SecurityAuditLog> findByEventType(String eventType);
    List<SecurityAuditLog> findByIpAddress(String ipAddress);

    long countByEventTypeAndIpAddressAndCreatedAtAfter(String eventType, String ipAddress, Instant since);
    long countByEventTypeAndUserIdAndCreatedAtAfter(String eventType, Long userId, Instant since);

    List<SecurityAuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<SecurityAuditLog> findByEventTypeOrderByCreatedAtDesc(String eventType, Pageable pageable);
    List<SecurityAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
