// backend/src/test/java/com/autoloan/backend/controller/ApiKeyControllerTest.java
package com.autoloan.backend.controller;

import java.time.Instant;
import java.util.List;

import com.autoloan.backend.dto.apikey.ApiKeyCreateRequest;
import com.autoloan.backend.dto.apikey.ApiKeyResponse;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.ApiKeyService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ApiKeyService apiKeyService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        ApiKeyController controller = new ApiKeyController(apiKeyService, jwtTokenProvider);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private void mockAuth() {
        when(jwtTokenProvider.getUserIdFromToken("jwt-token")).thenReturn(1L);
    }

    private ApiKeyResponse buildResponse() {
        return ApiKeyResponse.builder()
                .id(1L)
                .name("Test Key")
                .active(true)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();
    }

    // ==================== list ====================

    @Test
    void listShouldReturn200() throws Exception {
        mockAuth();
        when(apiKeyService.list(1L)).thenReturn(List.of(buildResponse()));

        mockMvc.perform(get("/api/auth/api-keys")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Key"))
                .andExpect(jsonPath("$[0].active").value(true));
    }

    @Test
    void listShouldReturnEmptyArray() throws Exception {
        mockAuth();
        when(apiKeyService.list(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/auth/api-keys")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ==================== findOne ====================

    @Test
    void findOneShouldReturn200() throws Exception {
        mockAuth();
        when(apiKeyService.findOne(1L, 1L)).thenReturn(buildResponse());

        mockMvc.perform(get("/api/auth/api-keys/1")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Key"));
    }

    @Test
    void findOneShouldReturn404WhenNotFound() throws Exception {
        mockAuth();
        when(apiKeyService.findOne(1L, 99L))
                .thenThrow(new ResourceNotFoundException("API key not found"));

        mockMvc.perform(get("/api/auth/api-keys/99")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("API key not found"));
    }

    // ==================== create ====================

    @Test
    void createShouldReturn201WithKey() throws Exception {
        mockAuth();
        ApiKeyResponse resp = buildResponse();
        resp.setKey("raw-key-value");
        when(apiKeyService.create(eq(1L), eq("New Key"), isNull())).thenReturn(resp);

        ApiKeyCreateRequest req = new ApiKeyCreateRequest();
        req.setName("New Key");

        mockMvc.perform(post("/api/auth/api-keys")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.key").value("raw-key-value"))
                .andExpect(jsonPath("$.name").value("Test Key"));
    }

    @Test
    void createShouldReturn400WhenNameBlank() throws Exception {
        ApiKeyCreateRequest req = new ApiKeyCreateRequest();
        req.setName("");

        mockMvc.perform(post("/api/auth/api-keys")
                        .header("Authorization", "Bearer jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ==================== revoke (PATCH) ====================

    @Test
    void revokePatchShouldReturn200() throws Exception {
        mockAuth();
        ApiKeyResponse resp = buildResponse();
        resp.setActive(false);
        when(apiKeyService.revoke(1L, 1L)).thenReturn(resp);

        mockMvc.perform(patch("/api/auth/api-keys/1/revoke")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    // ==================== revoke (POST) ====================

    @Test
    void revokePostShouldReturn200() throws Exception {
        mockAuth();
        ApiKeyResponse resp = buildResponse();
        resp.setActive(false);
        when(apiKeyService.revoke(1L, 1L)).thenReturn(resp);

        mockMvc.perform(post("/api/auth/api-keys/1/revoke")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void revokeShouldReturn404WhenNotFound() throws Exception {
        mockAuth();
        when(apiKeyService.revoke(1L, 99L))
                .thenThrow(new ResourceNotFoundException("API key not found"));

        mockMvc.perform(patch("/api/auth/api-keys/99/revoke")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("API key not found"));
    }

    // ==================== remove ====================

    @Test
    void removeShouldReturn204() throws Exception {
        mockAuth();
        doNothing().when(apiKeyService).remove(1L, 1L);

        mockMvc.perform(delete("/api/auth/api-keys/1")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isNoContent());

        verify(apiKeyService).remove(1L, 1L);
    }

    @Test
    void removeShouldReturn404WhenNotFound() throws Exception {
        mockAuth();
        doThrow(new ResourceNotFoundException("API key not found"))
                .when(apiKeyService).remove(1L, 99L);

        mockMvc.perform(delete("/api/auth/api-keys/99")
                        .header("Authorization", "Bearer jwt-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("API key not found"));
    }
}
