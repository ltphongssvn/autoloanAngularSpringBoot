package com.autoloan.backend.repository;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationRepositoryTest {

    @Test
    void shouldBeAnInterface() {
        assertTrue(ApplicationRepository.class.isInterface());
    }

    @Test
    void shouldExtendJpaRepository() {
        assertTrue(org.springframework.data.jpa.repository.JpaRepository.class
                .isAssignableFrom(ApplicationRepository.class));
    }
}
