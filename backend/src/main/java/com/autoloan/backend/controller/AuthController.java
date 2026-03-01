package com.autoloan.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.autoloan.backend.dto.auth.*;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        authService.logout(token);
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        return ResponseEntity.ok(authService.refreshToken(token));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
    }

    @GetMapping("/confirm-email")
    public ResponseEntity<MessageResponse> confirmEmail(@RequestParam("confirmation_token") String token) {
        String message = authService.confirmEmail(token);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<MessageResponse> resendConfirmation(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = authService.resendConfirmation(request.getEmail());
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @GetMapping("/unlock")
    public ResponseEntity<MessageResponse> unlockAccount(@RequestParam("unlock_token") String token) {
        String message = authService.unlockAccount(token);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    @PostMapping("/unlock")
    public ResponseEntity<MessageResponse> resendUnlock(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = authService.resendUnlock(request.getEmail());
        return ResponseEntity.ok(new MessageResponse(message));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
