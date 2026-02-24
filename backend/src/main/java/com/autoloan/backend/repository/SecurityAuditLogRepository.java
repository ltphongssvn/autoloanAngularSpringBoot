package com.autoloan.backend.repository;

import com.autoloan.backend.model.SecurityAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {

    List<SecurityAuditLog> findByUserId(Long userId);

    List<SecurityAuditLog> findByEventType(String eventType);

    List<SecurityAuditLog> findByIpAddress(String ipAddress);
}
