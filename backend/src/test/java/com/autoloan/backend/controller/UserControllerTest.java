package com.autoloan.backend.controller;

import com.autoloan.backend.dto.user.UserProfileResponse;
import com.autoloan.backend.dto.user.UserUpdateRequest;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private UserController userController;

    private UserProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        profileResponse = new UserProfileResponse();
        profileResponse.setId(1L);
        profileResponse.setEmail("test@example.com");
        profileResponse.setFirstName("John");
        profileResponse.setLastName("Doe");
        profileResponse.setPhone("555-1234");
        profileResponse.setRole("CUSTOMER");
    }

    @Test
    void getProfileShouldReturn200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(userService.getProfile(1L)).thenReturn(profileResponse);

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void getProfileShouldReturn404WhenNotFound() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(99L);
        when(userService.getProfile(99L)).thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found"));
    }

    @Test
    void updateProfileShouldReturn200() throws Exception {
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setFirstName("Jane");
        updateRequest.setLastName("Smith");
        updateRequest.setPhone("555-9999");

        UserProfileResponse updated = new UserProfileResponse();
        updated.setId(1L);
        updated.setEmail("test@example.com");
        updated.setFirstName("Jane");
        updated.setLastName("Smith");
        updated.setPhone("555-9999");
        updated.setRole("CUSTOMER");

        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(userService.updateProfile(eq(1L), any(UserUpdateRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"));
    }

    @Test
    void updateProfileShouldReturn400WhenValidationFails() throws Exception {
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setFirstName("");
        updateRequest.setLastName("");
        updateRequest.setPhone("");

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }
}
