package com.autoloan.backend.controller;

import com.autoloan.backend.dto.application.ApplicationRejectRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.document.DocumentResponse;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.dto.loan.PaginatedResponse;
import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.ApplicationWorkflowService;
import com.autoloan.backend.service.DocumentService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UnderwriterControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock private LoanService loanService;
    @Mock private ApplicationWorkflowService workflowService;
    @Mock private NoteService noteService;
    @Mock private DocumentService documentService;
    @Mock private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private UnderwriterController underwriterController;

    private LoanApplicationResponse testResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(underwriterController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testResponse = new LoanApplicationResponse();
        testResponse.setId(1L);
        testResponse.setApplicationNumber("APP-TEST1234");
        testResponse.setStatus("SUBMITTED");
    }

    @Test
    void findAll_returns200() throws Exception {
        PaginatedResponse<LoanApplicationResponse> paginatedResponse = new PaginatedResponse<>(
                List.of(testResponse), 1, 20, 1, 1);
        when(loanService.getApplicationsPaginated(isNull(), isNull(), isNull(), isNull(), eq(1), eq(20)))
                .thenReturn(paginatedResponse);

        mockMvc.perform(get("/api/underwriter/applications")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void findOne_returns200() throws Exception {
        when(loanService.getApplicationById(1L)).thenReturn(testResponse);

        mockMvc.perform(get("/api/underwriter/applications/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationNumber").value("APP-TEST1234"));
    }

    @Test
    void approve_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(300L);
        testResponse.setStatus("APPROVED");
        when(workflowService.approve(eq(1L), eq(300L), any())).thenReturn(testResponse);

        mockMvc.perform(post("/api/underwriter/applications/1/approve")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void reject_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(300L);
        testResponse.setStatus("REJECTED");
        when(workflowService.reject(eq(1L), eq(300L), any())).thenReturn(testResponse);

        ApplicationRejectRequest req = new ApplicationRejectRequest();
        req.setReason("High risk");

        mockMvc.perform(post("/api/underwriter/applications/1/reject")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void requestDocuments_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(300L);
        testResponse.setStatus("PENDING_DOCUMENTS");
        when(workflowService.requestDocuments(1L, 300L)).thenReturn(testResponse);

        mockMvc.perform(post("/api/underwriter/applications/1/request-documents")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_DOCUMENTS"));
    }

    @Test
    void addNote_returns200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(300L);
        NoteResponse noteResp = new NoteResponse();
        noteResp.setId(1L);
        noteResp.setNote("Underwriter note");
        when(noteService.createNote(eq(1L), eq(300L), any(NoteCreateRequest.class)))
                .thenReturn(noteResp);

        NoteCreateRequest req = new NoteCreateRequest();
        req.setNote("Underwriter note");
        req.setInternal(true);

        mockMvc.perform(post("/api/underwriter/applications/1/notes")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note").value("Underwriter note"));
    }

    @Test
    void getNotes_returns200() throws Exception {
        NoteResponse noteResp = new NoteResponse();
        noteResp.setId(1L);
        noteResp.setNote("A note");
        when(noteService.getNotesByApplication(1L)).thenReturn(List.of(noteResp));

        mockMvc.perform(get("/api/underwriter/applications/1/notes")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].note").value("A note"));
    }

    @Test
    void getDocuments_returns200() throws Exception {
        DocumentResponse docResp = new DocumentResponse();
        docResp.setId(1L);
        docResp.setDocType("DRIVERS_LICENSE");
        when(documentService.getDocumentsByApplicationForStaff(1L)).thenReturn(List.of(docResp));

        mockMvc.perform(get("/api/underwriter/applications/1/documents")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].docType").value("DRIVERS_LICENSE"));
    }

    @Test
    void getHistory_returns200() throws Exception {
        StatusHistoryResponse h = new StatusHistoryResponse();
        h.setId(1L);
        h.setFromStatus("SUBMITTED");
        h.setToStatus("UNDER_REVIEW");
        when(workflowService.getHistory(1L)).thenReturn(List.of(h));

        mockMvc.perform(get("/api/underwriter/applications/1/history")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].toStatus").value("UNDER_REVIEW"));
    }
}
