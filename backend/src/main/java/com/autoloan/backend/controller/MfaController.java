// backend/src/main/java/com/autoloan/backend/controller/MfaController.java
package com.autoloan.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.autoloan.backend.dto.mfa.*;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.MfaService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth/mfa")
public class MfaController {

    private final MfaService mfaService;
    private final JwtTokenProvider jwtTokenProvider;

    public MfaController(MfaService mfaService, JwtTokenProvider jwtTokenProvider) {
        this.mfaService = mfaService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/status")
    public ResponseEntity<MfaStatusResponse> getStatus(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(mfaService.getStatus(userId));
    }

    @PostMapping("/setup")
    public ResponseEntity<MfaSetupResponse> setup(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(mfaService.setup(userId));
    }

    @PostMapping("/enable")
    public ResponseEntity<MfaEnableResponse> enable(
            HttpServletRequest request,
            @Valid @RequestBody MfaVerifyRequest body) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(mfaService.enable(userId, body.getCode()));
    }

    @DeleteMapping("/disable")
    public ResponseEntity<MfaStatusResponse> disableDelete(
            HttpServletRequest request,
            @Valid @RequestBody MfaVerifyRequest body) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(mfaService.disable(userId, body.getCode()));
    }

    @PostMapping("/disable")
    public ResponseEntity<MfaStatusResponse> disablePost(
            HttpServletRequest request,
            @Valid @RequestBody MfaVerifyRequest body) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(mfaService.disable(userId, body.getCode()));
    }

    @PostMapping("/verify")
    public ResponseEntity<MfaVerifyResponse> verify(
            HttpServletRequest request,
            @Valid @RequestBody MfaVerifyRequest body) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(mfaService.verify(userId, body.getCode()));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
