// backend/src/main/java/com/autoloan/backend/service/ApiKeyService.java
package com.autoloan.backend.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autoloan.backend.dto.apikey.ApiKeyResponse;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.ApiKey;
import com.autoloan.backend.repository.ApiKeyRepository;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final SecureRandom secureRandom;

    public ApiKeyService(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.secureRandom = new SecureRandom();
    }

    public List<ApiKeyResponse> list(Long userId) {
        return apiKeyRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ApiKeyResponse findOne(Long userId, Long id) {
        ApiKey key = apiKeyRepository.findById(id)
                .filter(k -> k.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("API key not found"));
        return toResponse(key);
    }

    @Transactional
    public ApiKeyResponse create(Long userId, String name, Instant expiresAt) {
        String rawKey = generateRawKey();
        String digest = sha256(rawKey);

        ApiKey apiKey = ApiKey.builder()
                .name(name)
                .keyDigest(digest)
                .active(true)
                .expiresAt(expiresAt)
                .userId(userId)
                .build();

        ApiKey saved = apiKeyRepository.save(apiKey);
        ApiKeyResponse response = toResponse(saved);
        response.setKey(rawKey);
        return response;
    }

    @Transactional
    public ApiKeyResponse revoke(Long userId, Long id) {
        ApiKey key = apiKeyRepository.findById(id)
                .filter(k -> k.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("API key not found"));
        key.setActive(false);
        apiKeyRepository.save(key);
        return toResponse(key);
    }

    @Transactional
    public void remove(Long userId, Long id) {
        ApiKey key = apiKeyRepository.findById(id)
                .filter(k -> k.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("API key not found"));
        apiKeyRepository.delete(key);
    }

    private String generateRawKey() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private ApiKeyResponse toResponse(ApiKey key) {
        return ApiKeyResponse.builder()
                .id(key.getId())
                .name(key.getName())
                .active(key.isActive())
                .expiresAt(key.getExpiresAt())
                .lastUsedAt(key.getLastUsedAt())
                .createdAt(key.getCreatedAt())
                .build();
    }
}
