package com.autoloan.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autoloan.backend.dto.user.UserProfileResponse;
import com.autoloan.backend.dto.user.UserUpdateRequest;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public UserController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            HttpServletRequest request,
            @Valid @RequestBody UserUpdateRequest updateRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(userService.updateProfile(userId, updateRequest));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponse> patchProfile(
            HttpServletRequest request,
            @Valid @RequestBody UserUpdateRequest updateRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(userService.updateProfile(userId, updateRequest));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
