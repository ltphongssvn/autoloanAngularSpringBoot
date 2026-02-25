// backend/src/test/java/com/autoloan/backend/controller/MfaControllerTest.java
package com.autoloan.backend.controller;

import com.autoloan.backend.dto.mfa.*;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.UnauthorizedException;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.MfaService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MfaControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private MfaService mfaService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        MfaController controller = new MfaController(mfaService, jwtTokenProvider);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private void mockAuth() {
        when(jwtTokenProvider.getUserIdFromToken("jwt-token")).thenReturn(1L);
    }

    // ==================== getStatus ====================

    @Test
    void getStatusShouldReturn200WhenDisabled() throws Exception {
        mockAuth();
        when(mfaService.getStatus(1L)).thenReturn(new MfaStatusResponse(false));

        mockMvc.perform(get("/api/auth/mfa/status")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(false));
    }

    @Test
    void getStatusShouldReturn200WhenEnabled() throws Exception {
        mockAuth();
        when(mfaService.getStatus(1L)).thenReturn(new MfaStatusResponse(true));

        mockMvc.perform(get("/api/auth/mfa/status")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(true));
    }

    // ==================== setup ====================

    @Test
    void setupShouldReturn200WithSecretAndQr() throws Exception {
        mockAuth();
        when(mfaService.setup(1L)).thenReturn(
                new MfaSetupResponse("SECRET123", "otpauth://totp/test", "data:image/png;base64,abc"));

        mockMvc.perform(post("/api/auth/mfa/setup")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").value("SECRET123"))
                .andExpect(jsonPath("$.otpAuthUrl").value("otpauth://totp/test"))
                .andExpect(jsonPath("$.qrCodeSvg").value("data:image/png;base64,abc"));
    }

    @Test
    void setupShouldReturn400WhenAlreadyEnabled() throws Exception {
        mockAuth();
        when(mfaService.setup(1L)).thenThrow(new BadRequestException("MFA is already enabled"));

        mockMvc.perform(post("/api/auth/mfa/setup")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("MFA is already enabled"));
    }

    // ==================== enable ====================

    @Test
    void enableShouldReturn200WithBackupCodes() throws Exception {
        mockAuth();
        when(mfaService.enable(1L, "123456")).thenReturn(
                new MfaEnableResponse(true, List.of("aabb", "ccdd")));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("123456");

        mockMvc.perform(post("/api/auth/mfa/enable")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(true))
                .andExpect(jsonPath("$.backupCodes[0]").value("aabb"));
    }

    @Test
    void enableShouldReturn401WhenInvalidCode() throws Exception {
        mockAuth();
        when(mfaService.enable(1L, "000000"))
                .thenThrow(new UnauthorizedException("Invalid verification code"));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("000000");

        mockMvc.perform(post("/api/auth/mfa/enable")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid verification code"));
    }

    @Test
    void enableShouldReturn400WhenSetupNotInitiated() throws Exception {
        mockAuth();
        when(mfaService.enable(1L, "123456"))
                .thenThrow(new BadRequestException("MFA setup not initiated. Call setup first."));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("123456");

        mockMvc.perform(post("/api/auth/mfa/enable")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("MFA setup not initiated. Call setup first."));
    }

    // ==================== disable (DELETE) ====================

    @Test
    void disableDeleteShouldReturn200() throws Exception {
        mockAuth();
        when(mfaService.disable(1L, "123456")).thenReturn(new MfaStatusResponse(false));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("123456");

        mockMvc.perform(delete("/api/auth/mfa/disable")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(false));
    }

    // ==================== disable (POST) ====================

    @Test
    void disablePostShouldReturn200() throws Exception {
        mockAuth();
        when(mfaService.disable(1L, "123456")).thenReturn(new MfaStatusResponse(false));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("123456");

        mockMvc.perform(post("/api/auth/mfa/disable")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mfaEnabled").value(false));
    }

    @Test
    void disableShouldReturn400WhenNotEnabled() throws Exception {
        mockAuth();
        when(mfaService.disable(1L, "123456"))
                .thenThrow(new BadRequestException("MFA is not enabled"));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("123456");

        mockMvc.perform(post("/api/auth/mfa/disable")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("MFA is not enabled"));
    }

    // ==================== verify ====================

    @Test
    void verifyShouldReturn200WhenValid() throws Exception {
        mockAuth();
        when(mfaService.verify(1L, "123456")).thenReturn(new MfaVerifyResponse(true, false));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("123456");

        mockMvc.perform(post("/api/auth/mfa/verify")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.backupCodeUsed").value(false));
    }

    @Test
    void verifyShouldReturn200WhenBackupCodeUsed() throws Exception {
        mockAuth();
        when(mfaService.verify(1L, "aabbccdd")).thenReturn(new MfaVerifyResponse(true, true));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("aabbccdd");

        mockMvc.perform(post("/api/auth/mfa/verify")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.backupCodeUsed").value(true));
    }

    @Test
    void verifyShouldReturn401WhenInvalidCode() throws Exception {
        mockAuth();
        when(mfaService.verify(1L, "000000"))
                .thenThrow(new UnauthorizedException("Invalid verification code"));

        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("000000");

        mockMvc.perform(post("/api/auth/mfa/verify")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid verification code"));
    }

    @Test
    void verifyShouldReturn400WhenCodeBlank() throws Exception {
        MfaVerifyRequest req = new MfaVerifyRequest();
        req.setCode("");

        mockMvc.perform(post("/api/auth/mfa/verify")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
