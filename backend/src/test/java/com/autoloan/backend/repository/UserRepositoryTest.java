package com.autoloan.backend.repository;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryTest {

    @Test
    void shouldBeAnInterface() {
        assertTrue(UserRepository.class.isInterface());
    }

    @Test
    void shouldExtendJpaRepository() {
        assertTrue(org.springframework.data.jpa.repository.JpaRepository.class
                .isAssignableFrom(UserRepository.class));
    }
}
