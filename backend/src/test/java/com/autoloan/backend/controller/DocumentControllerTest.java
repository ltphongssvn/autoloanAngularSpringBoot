package com.autoloan.backend.controller;

import com.autoloan.backend.dto.document.DocumentResponse;
import com.autoloan.backend.dto.document.DocumentStatusUpdateRequest;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.DocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DocumentControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private DocumentService documentService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private DocumentController documentController;

    private DocumentResponse testResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testResponse = new DocumentResponse();
        testResponse.setId(1L);
        testResponse.setDocType("DRIVERS_LICENSE");
        testResponse.setFileName("license.pdf");
        testResponse.setFileUrl("uploads/documents/uuid_license.pdf");
        testResponse.setFileSize(1024);
        testResponse.setContentType("application/pdf");
        testResponse.setStatus("UPLOADED");
        testResponse.setApplicationId(10L);
        testResponse.setCreatedAt(Instant.now());
        testResponse.setUpdatedAt(Instant.now());
    }

    @Test
    void uploadDocument_returns201() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(100L);
        when(documentService.uploadDocument(eq(10L), eq(100L), eq("DRIVERS_LICENSE"), any()))
                .thenReturn(testResponse);

        MockMultipartFile file = new MockMultipartFile(
                "file", "license.pdf", "application/pdf", new byte[1024]);

        mockMvc.perform(multipart("/api/applications/10/documents")
                        .file(file)
                        .param("doc_type", "DRIVERS_LICENSE")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.docType").value("DRIVERS_LICENSE"))
                .andExpect(jsonPath("$.status").value("UPLOADED"));
    }

    @Test
    void getDocumentsByApplication_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(100L);
        when(documentService.getDocumentsByApplication(10L, 100L))
                .thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/applications/10/documents")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].docType").value("DRIVERS_LICENSE"));
    }

    @Test
    void getDocument_returns200() throws Exception {
        when(documentService.getDocument(1L)).thenReturn(testResponse);

        mockMvc.perform(get("/api/documents/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getDocument_returns404WhenNotFound() throws Exception {
        when(documentService.getDocument(999L))
                .thenThrow(new ResourceNotFoundException("Document not found"));

        mockMvc.perform(get("/api/documents/999")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Document not found"));
    }

    @Test
    void deleteDocument_returns204() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(100L);
        doNothing().when(documentService).deleteDocument(1L, 100L);

        mockMvc.perform(delete("/api/documents/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNoContent());

        verify(documentService).deleteDocument(1L, 100L);
    }

    @Test
    void downloadDocument_returns200() throws Exception {
        when(documentService.getDocumentFileUrl(1L)).thenReturn("uploads/documents/uuid_license.pdf");

        mockMvc.perform(get("/api/documents/1/download")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("uploads/documents/uuid_license.pdf"));
    }

    @Test
    void updateDocumentStatus_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(200L);

        DocumentResponse verified = new DocumentResponse();
        verified.setId(1L);
        verified.setDocType("DRIVERS_LICENSE");
        verified.setStatus("VERIFIED");
        verified.setVerifiedById(200L);
        verified.setVerifiedAt(Instant.now());

        when(documentService.updateDocumentStatus(eq(1L), eq(200L), any(DocumentStatusUpdateRequest.class)))
                .thenReturn(verified);

        DocumentStatusUpdateRequest req = new DocumentStatusUpdateRequest();
        req.setStatus("VERIFIED");

        mockMvc.perform(patch("/api/documents/1/status")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VERIFIED"))
                .andExpect(jsonPath("$.verifiedById").value(200));
    }
}
