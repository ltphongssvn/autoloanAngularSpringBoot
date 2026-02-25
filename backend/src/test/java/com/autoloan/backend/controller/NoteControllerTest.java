package com.autoloan.backend.controller;

import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.NoteService;
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

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NoteControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private NoteService noteService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private NoteController noteController;

    private NoteResponse testResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(noteController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testResponse = new NoteResponse();
        testResponse.setId(1L);
        testResponse.setNote("Test note");
        testResponse.setInternal(false);
        testResponse.setApplicationId(10L);
        testResponse.setUserId(100L);
        testResponse.setCreatedAt(Instant.now());
        testResponse.setUpdatedAt(Instant.now());
    }

    @Test
    void createNote_returns201() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(100L);
        when(noteService.createNote(eq(10L), eq(100L), any(NoteCreateRequest.class)))
                .thenReturn(testResponse);

        NoteCreateRequest request = new NoteCreateRequest();
        request.setNote("Test note");
        request.setInternal(false);

        mockMvc.perform(post("/api/applications/10/notes")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.note").value("Test note"));
    }

    @Test
    void createNote_returns400WhenBlank() throws Exception {
        NoteCreateRequest request = new NoteCreateRequest();
        request.setNote("");

        mockMvc.perform(post("/api/applications/10/notes")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getNotesByApplication_returns200() throws Exception {
        when(noteService.getNotesByApplication(10L)).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/applications/10/notes")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].note").value("Test note"));
    }

    @Test
    void getNotesByApplication_returns404WhenAppNotFound() throws Exception {
        when(noteService.getNotesByApplication(999L))
                .thenThrow(new ResourceNotFoundException("Application not found"));

        mockMvc.perform(get("/api/applications/999/notes")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Application not found"));
    }
}
