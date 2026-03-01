// backend/src/test/java/com/autoloan/backend/controller/AuthControllerTest.java
package com.autoloan.backend.controller;

import com.autoloan.backend.dto.auth.*;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.UnauthorizedException;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(authService, jwtTokenProvider);
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private AuthResponse buildAuthResponse() {
        AuthResponse response = new AuthResponse();
        response.setToken("jwt-token");
        response.setEmail("test@example.com");
        response.setFirstName("John");
        response.setLastName("Doe");
        response.setRole("CUSTOMER");
        response.setUserId(1L);
        return response;
    }

    // ==================== signup ====================

    @Test
    void signupShouldReturn201WithToken() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("555-1234");

        when(authService.signup(any(SignupRequest.class))).thenReturn(buildAuthResponse());

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void signupShouldReturn400WhenEmailExists() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("555-1234");

        when(authService.signup(any(SignupRequest.class)))
                .thenThrow(new BadRequestException("Email already registered"));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void signupShouldReturn400WhenValidationFails() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("");
        request.setPassword("");
        request.setFirstName("");
        request.setLastName("");
        request.setPhone("");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    // ==================== login ====================

    @Test
    void loginShouldReturn200WithToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(authService.login(any(LoginRequest.class))).thenReturn(buildAuthResponse());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void loginShouldReturn401WhenInvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrong");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new UnauthorizedException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    // ==================== logout ====================

    @Test
    void logoutShouldReturn200() throws Exception {
        doNothing().when(authService).logout(anyString());

        mockMvc.perform(delete("/api/auth/logout")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));

        verify(authService).logout("Bearer jwt-token");
    }

    // ==================== refresh ====================

    @Test
    void refreshShouldReturn200WithNewToken() throws Exception {
        AuthResponse response = buildAuthResponse();
        response.setToken("new-jwt-token");
        when(authService.refreshToken(anyString())).thenReturn(response);

        mockMvc.perform(post("/api/auth/refresh")
                        .header("Authorization", "Bearer old-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-jwt-token"));
    }

    // ==================== getCurrentUser ====================

    @Test
    void getMeShouldReturn200WithUser() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("jwt-token")).thenReturn(1L);
        when(authService.getCurrentUser(1L)).thenReturn(buildAuthResponse());

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.userId").value(1));
    }

    // ==================== forgotPassword ====================

    @Test
    void forgotPasswordShouldReturn200() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        when(authService.forgotPassword("test@example.com"))
                .thenReturn("If the email exists, a reset link has been sent");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If the email exists, a reset link has been sent"));
    }

    // ==================== resetPassword ====================

    @Test
    void resetPasswordShouldReturn200() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("reset-token");
        request.setPassword("newPassword123");

        doNothing().when(authService).resetPassword("reset-token", "newPassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"));
    }

    @Test
    void resetPasswordShouldReturn400WhenInvalidToken() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("bad-token");
        request.setPassword("newPassword123");

        doThrow(new BadRequestException("Invalid or expired reset token"))
                .when(authService).resetPassword("bad-token", "newPassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired reset token"));
    }

    // ==================== confirmEmail ====================

    @Test
    void confirmEmailShouldReturn200() throws Exception {
        when(authService.confirmEmail("confirm-token"))
                .thenReturn("Email confirmed successfully");

        mockMvc.perform(get("/api/auth/confirm-email")
                        .param("confirmation_token", "confirm-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email confirmed successfully"));
    }

    @Test
    void confirmEmailShouldReturn400WhenInvalidToken() throws Exception {
        when(authService.confirmEmail("bad-token"))
                .thenThrow(new BadRequestException("Invalid confirmation token"));

        mockMvc.perform(get("/api/auth/confirm-email")
                        .param("confirmation_token", "bad-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid confirmation token"));
    }

    // ==================== resendConfirmation ====================

    @Test
    void resendConfirmationShouldReturn200() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        when(authService.resendConfirmation("test@example.com"))
                .thenReturn("If the email exists and is unconfirmed, a confirmation link has been sent");

        mockMvc.perform(post("/api/auth/confirm-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If the email exists and is unconfirmed, a confirmation link has been sent"));
    }

    // ==================== unlockAccount ====================

    @Test
    void unlockAccountShouldReturn200() throws Exception {
        when(authService.unlockAccount("unlock-token"))
                .thenReturn("Account unlocked successfully");

        mockMvc.perform(get("/api/auth/unlock")
                        .param("unlock_token", "unlock-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Account unlocked successfully"));
    }

    @Test
    void unlockAccountShouldReturn400WhenInvalidToken() throws Exception {
        when(authService.unlockAccount("bad-token"))
                .thenThrow(new BadRequestException("Invalid unlock token"));

        mockMvc.perform(get("/api/auth/unlock")
                        .param("unlock_token", "bad-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid unlock token"));
    }

    // ==================== resendUnlock ====================

    @Test
    void resendUnlockShouldReturn200() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        when(authService.resendUnlock("test@example.com"))
                .thenReturn("If the email exists and is locked, unlock instructions have been sent");

        mockMvc.perform(post("/api/auth/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If the email exists and is locked, unlock instructions have been sent"));
    }
}
