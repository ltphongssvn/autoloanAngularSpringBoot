package com.autoloan.backend.repository;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

import static org.junit.jupiter.api.Assertions.*;

class RemainingRepositoriesTest {

    @Test
    void allRepositoriesShouldBeInterfaces() {
        assertTrue(AddressRepository.class.isInterface());
        assertTrue(FinancialInfoRepository.class.isInterface());
        assertTrue(VehicleRepository.class.isInterface());
        assertTrue(DocumentRepository.class.isInterface());
        assertTrue(ApplicationNoteRepository.class.isInterface());
        assertTrue(StatusHistoryRepository.class.isInterface());
        assertTrue(JwtDenylistRepository.class.isInterface());
        assertTrue(ApiKeyRepository.class.isInterface());
        assertTrue(SecurityAuditLogRepository.class.isInterface());
    }

    @Test
    void allRepositoriesShouldExtendJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(AddressRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(FinancialInfoRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(VehicleRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(DocumentRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(ApplicationNoteRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(StatusHistoryRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(JwtDenylistRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(ApiKeyRepository.class));
        assertTrue(JpaRepository.class.isAssignableFrom(SecurityAuditLogRepository.class));
    }
}
