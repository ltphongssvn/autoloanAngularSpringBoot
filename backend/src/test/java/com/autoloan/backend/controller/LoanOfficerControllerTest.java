package com.autoloan.backend.controller;

import com.autoloan.backend.dto.application.ApplicationApprovalRequest;
import com.autoloan.backend.dto.application.ApplicationRejectRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.ApplicationWorkflowService;
import com.autoloan.backend.service.LoanService;
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
class LoanOfficerControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private LoanService loanService;

    @Mock
    private ApplicationWorkflowService workflowService;

    @Mock
    private NoteService noteService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private LoanOfficerController loanOfficerController;

    private LoanApplicationResponse testResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(loanOfficerController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testResponse = new LoanApplicationResponse();
        testResponse.setId(1L);
        testResponse.setApplicationNumber("APP-TEST1234");
        testResponse.setStatus("SUBMITTED");
    }

    @Test
    void findAll_returns200() throws Exception {
        when(loanService.getAllApplications()).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/loan-officer/applications")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].applicationNumber").value("APP-TEST1234"));
    }

    @Test
    void findOne_returns200() throws Exception {
        when(loanService.getApplicationById(1L)).thenReturn(testResponse);

        mockMvc.perform(get("/api/loan-officer/applications/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void findOne_returns404() throws Exception {
        when(loanService.getApplicationById(999L))
                .thenThrow(new ResourceNotFoundException("Application not found"));

        mockMvc.perform(get("/api/loan-officer/applications/999")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNotFound());
    }

    @Test
    void startVerification_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(200L);
        testResponse.setStatus("UNDER_REVIEW");
        when(workflowService.startVerification(1L, 200L)).thenReturn(testResponse);

        mockMvc.perform(patch("/api/loan-officer/applications/1/verify")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"));
    }

    @Test
    void moveToReview_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(200L);
        testResponse.setStatus("UNDER_REVIEW");
        when(workflowService.moveToReview(1L, 200L)).thenReturn(testResponse);

        mockMvc.perform(patch("/api/loan-officer/applications/1/review")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"));
    }

    @Test
    void requestDocuments_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(200L);
        testResponse.setStatus("PENDING_DOCUMENTS");
        when(workflowService.requestDocuments(1L, 200L)).thenReturn(testResponse);

        mockMvc.perform(patch("/api/loan-officer/applications/1/request-documents")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_DOCUMENTS"));
    }

    @Test
    void approve_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(200L);
        testResponse.setStatus("APPROVED");
        when(workflowService.approve(eq(1L), eq(200L), any())).thenReturn(testResponse);

        mockMvc.perform(patch("/api/loan-officer/applications/1/approve")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void reject_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(200L);
        testResponse.setStatus("REJECTED");
        when(workflowService.reject(eq(1L), eq(200L), any())).thenReturn(testResponse);

        ApplicationRejectRequest req = new ApplicationRejectRequest();
        req.setReason("Insufficient income");

        mockMvc.perform(patch("/api/loan-officer/applications/1/reject")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void getHistory_returns200() throws Exception {
        StatusHistoryResponse h = new StatusHistoryResponse();
        h.setId(1L);
        h.setFromStatus("SUBMITTED");
        h.setToStatus("UNDER_REVIEW");
        h.setCreatedAt(Instant.now());
        when(workflowService.getHistory(1L)).thenReturn(List.of(h));

        mockMvc.perform(get("/api/loan-officer/applications/1/history")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fromStatus").value("SUBMITTED"));
    }

    @Test
    void addNote_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(200L);
        NoteResponse noteResp = new NoteResponse();
        noteResp.setId(1L);
        noteResp.setNote("Review note");
        when(noteService.createNote(eq(1L), eq(200L), any(NoteCreateRequest.class)))
                .thenReturn(noteResp);

        NoteCreateRequest req = new NoteCreateRequest();
        req.setNote("Review note");
        req.setInternal(true);

        mockMvc.perform(post("/api/loan-officer/applications/1/notes")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note").value("Review note"));
    }
}
