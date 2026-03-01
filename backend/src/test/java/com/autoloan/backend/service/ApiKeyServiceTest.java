// backend/src/test/java/com/autoloan/backend/service/ApiKeyServiceTest.java
package com.autoloan.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autoloan.backend.dto.apikey.ApiKeyResponse;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.ApiKey;
import com.autoloan.backend.repository.ApiKeyRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {

    @Mock
    private ApiKeyRepository apiKeyRepository;

    private ApiKeyService apiKeyService;

    private ApiKey existingKey;

    @BeforeEach
    void setUp() {
        apiKeyService = new ApiKeyService(apiKeyRepository);

        existingKey = ApiKey.builder()
                .id(1L)
                .name("Test Key")
                .keyDigest("digest123")
                .active(true)
                .userId(1L)
                .createdAt(Instant.now())
                .build();
    }

    // ==================== list ====================

    @Test
    void listShouldReturnUserKeys() {
        when(apiKeyRepository.findByUserId(1L)).thenReturn(List.of(existingKey));

        List<ApiKeyResponse> result = apiKeyService.list(1L);

        assertEquals(1, result.size());
        assertEquals("Test Key", result.get(0).getName());
        assertTrue(result.get(0).isActive());
    }

    @Test
    void listShouldReturnEmptyWhenNoKeys() {
        when(apiKeyRepository.findByUserId(1L)).thenReturn(List.of());

        List<ApiKeyResponse> result = apiKeyService.list(1L);

        assertTrue(result.isEmpty());
    }

    // ==================== findOne ====================

    @Test
    void findOneShouldReturnKey() {
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(existingKey));

        ApiKeyResponse result = apiKeyService.findOne(1L, 1L);

        assertEquals("Test Key", result.getName());
        assertEquals(1L, result.getId());
    }

    @Test
    void findOneShouldThrowWhenNotFound() {
        when(apiKeyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> apiKeyService.findOne(1L, 99L));
    }

    @Test
    void findOneShouldThrowWhenDifferentUser() {
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(existingKey));

        assertThrows(ResourceNotFoundException.class, () -> apiKeyService.findOne(99L, 1L));
    }

    // ==================== create ====================

    @Test
    void createShouldReturnKeyWithRawValue() {
        when(apiKeyRepository.save(any(ApiKey.class))).thenAnswer(inv -> {
            ApiKey k = inv.getArgument(0);
            k.setId(2L);
            k.setCreatedAt(Instant.now());
            return k;
        });

        ApiKeyResponse result = apiKeyService.create(1L, "New Key", null);

        assertEquals("New Key", result.getName());
        assertNotNull(result.getKey());
        assertFalse(result.getKey().isEmpty());
        assertTrue(result.isActive());
        verify(apiKeyRepository).save(any(ApiKey.class));
    }

    @Test
    void createShouldSetExpiresAt() {
        Instant expires = Instant.now().plusSeconds(86400);
        when(apiKeyRepository.save(any(ApiKey.class))).thenAnswer(inv -> {
            ApiKey k = inv.getArgument(0);
            k.setId(3L);
            k.setCreatedAt(Instant.now());
            return k;
        });

        ApiKeyResponse result = apiKeyService.create(1L, "Expiring Key", expires);

        assertEquals("Expiring Key", result.getName());
        assertEquals(expires, result.getExpiresAt());
    }

    // ==================== revoke ====================

    @Test
    void revokeShouldDeactivateKey() {
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(existingKey));
        when(apiKeyRepository.save(any(ApiKey.class))).thenReturn(existingKey);

        ApiKeyResponse result = apiKeyService.revoke(1L, 1L);

        assertFalse(result.isActive());
        assertFalse(existingKey.isActive());
        verify(apiKeyRepository).save(existingKey);
    }

    @Test
    void revokeShouldThrowWhenNotFound() {
        when(apiKeyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> apiKeyService.revoke(1L, 99L));
    }

    @Test
    void revokeShouldThrowWhenDifferentUser() {
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(existingKey));

        assertThrows(ResourceNotFoundException.class, () -> apiKeyService.revoke(99L, 1L));
    }

    // ==================== remove ====================

    @Test
    void removeShouldDeleteKey() {
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(existingKey));
        doNothing().when(apiKeyRepository).delete(existingKey);

        apiKeyService.remove(1L, 1L);

        verify(apiKeyRepository).delete(existingKey);
    }

    @Test
    void removeShouldThrowWhenNotFound() {
        when(apiKeyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> apiKeyService.remove(1L, 99L));
    }

    @Test
    void removeShouldThrowWhenDifferentUser() {
        when(apiKeyRepository.findById(1L)).thenReturn(Optional.of(existingKey));

        assertThrows(ResourceNotFoundException.class, () -> apiKeyService.remove(99L, 1L));
    }
}
