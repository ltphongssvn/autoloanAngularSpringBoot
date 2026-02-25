// backend/src/main/java/com/autoloan/backend/controller/ApiKeyController.java
package com.autoloan.backend.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.autoloan.backend.dto.apikey.ApiKeyCreateRequest;
import com.autoloan.backend.dto.apikey.ApiKeyResponse;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.ApiKeyService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth/api-keys")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final JwtTokenProvider jwtTokenProvider;

    public ApiKeyController(ApiKeyService apiKeyService, JwtTokenProvider jwtTokenProvider) {
        this.apiKeyService = apiKeyService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public ResponseEntity<List<ApiKeyResponse>> list(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(apiKeyService.list(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiKeyResponse> findOne(HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(apiKeyService.findOne(userId, id));
    }

    @PostMapping
    public ResponseEntity<ApiKeyResponse> create(
            HttpServletRequest request,
            @Valid @RequestBody ApiKeyCreateRequest body) {
        Long userId = getUserIdFromRequest(request);
        Instant expiresAt = body.getExpiresAt() != null ? Instant.parse(body.getExpiresAt()) : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(apiKeyService.create(userId, body.getName(), expiresAt));
    }

    @PatchMapping("/{id}/revoke")
    public ResponseEntity<ApiKeyResponse> revokePatch(HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(apiKeyService.revoke(userId, id));
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<ApiKeyResponse> revokePost(HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(apiKeyService.revoke(userId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        apiKeyService.remove(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
