package com.autoloan.backend.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.autoloan.backend.dto.application.ApplicationSignRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.loan.LoanApplicationRequest;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.dto.loan.PaginatedResponse;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.GlobalExceptionHandler;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.repository.ApplicationRepository;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.ApplicationWorkflowService;
import com.autoloan.backend.service.LoanService;
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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class LoanControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private LoanService loanService;

    @Mock
    private ApplicationWorkflowService workflowService;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private LoanController loanController;

    private LoanApplicationResponse loanResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(loanController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        loanResponse = new LoanApplicationResponse();
        loanResponse.setId(1L);
        loanResponse.setApplicationNumber("APP-12345678");
        loanResponse.setStatus("DRAFT");
        loanResponse.setLoanAmount(new BigDecimal("25000.00"));
        loanResponse.setVehicleMake("Toyota");
    }

    @Test
    void createApplicationShouldReturn201() throws Exception {
        LoanApplicationRequest request = new LoanApplicationRequest();
        request.setLoanAmount(new BigDecimal("25000.00"));
        request.setDownPayment(new BigDecimal("5000.00"));
        request.setLoanTerm(36);
        request.setVehicleMake("Toyota");
        request.setVehicleModel("Camry");
        request.setVehicleYear(2024);

        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.createApplication(eq(1L), any(LoanApplicationRequest.class))).thenReturn(loanResponse);

        mockMvc.perform(post("/api/loans")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.applicationNumber").value("APP-12345678"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void createApplicationShouldReturn400WhenValidationFails() throws Exception {
        LoanApplicationRequest request = new LoanApplicationRequest();

        mockMvc.perform(post("/api/loans")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    void getUserApplicationsShouldReturn200() throws Exception {
        PaginatedResponse<LoanApplicationResponse> paginatedResponse = new PaginatedResponse<>(
                List.of(loanResponse), 1, 20, 1, 1);

        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.getApplicationsPaginated(eq(1L), isNull(), isNull(), isNull(), eq(1), eq(20)))
                .thenReturn(paginatedResponse);

        mockMvc.perform(get("/api/loans")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].applicationNumber").value("APP-12345678"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void getApplicationShouldReturn200() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.getApplication(1L, 1L)).thenReturn(loanResponse);

        mockMvc.perform(get("/api/loans/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getApplicationShouldReturn404WhenNotFound() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.getApplication(99L, 1L)).thenThrow(new ResourceNotFoundException("Application not found"));

        mockMvc.perform(get("/api/loans/99")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Application not found"));
    }

    @Test
    void updateApplicationShouldReturn200() throws Exception {
        LoanApplicationRequest request = new LoanApplicationRequest();
        request.setLoanAmount(new BigDecimal("30000.00"));
        request.setDownPayment(new BigDecimal("5000.00"));
        request.setLoanTerm(48);
        request.setVehicleMake("Honda");
        request.setVehicleModel("Accord");
        request.setVehicleYear(2024);

        loanResponse.setLoanAmount(new BigDecimal("30000.00"));
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.updateApplication(eq(1L), eq(1L), any(LoanApplicationRequest.class))).thenReturn(loanResponse);

        mockMvc.perform(patch("/api/loans/1")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loanAmount").value(30000.00));
    }

    @Test
    void updateApplicationShouldReturn400WhenNotDraft() throws Exception {
        LoanApplicationRequest request = new LoanApplicationRequest();
        request.setLoanAmount(new BigDecimal("30000.00"));
        request.setDownPayment(new BigDecimal("5000.00"));
        request.setLoanTerm(48);
        request.setVehicleMake("Honda");
        request.setVehicleModel("Accord");
        request.setVehicleYear(2024);

        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.updateApplication(eq(1L), eq(1L), any()))
                .thenThrow(new BadRequestException("Only draft applications can be updated"));

        mockMvc.perform(patch("/api/loans/1")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteApplicationShouldReturn204() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        doNothing().when(loanService).deleteApplication(1L, 1L);

        mockMvc.perform(delete("/api/loans/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isNoContent());

        verify(loanService).deleteApplication(1L, 1L);
    }

    @Test
    void deleteApplicationShouldReturn400WhenNotDraft() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        doThrow(new BadRequestException("Only draft applications can be deleted"))
                .when(loanService).deleteApplication(1L, 1L);

        mockMvc.perform(delete("/api/loans/1")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitApplicationShouldReturn200() throws Exception {
        loanResponse.setStatus("SUBMITTED");
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.submitApplication(1L, 1L)).thenReturn(loanResponse);

        mockMvc.perform(post("/api/loans/1/submit")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void submitApplicationShouldReturn400WhenNotDraft() throws Exception {
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(loanService.submitApplication(1L, 1L))
                .thenThrow(new BadRequestException("Only draft applications can be submitted"));

        mockMvc.perform(post("/api/loans/1/submit")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only draft applications can be submitted"));
    }

    @Test
    void signApplicationShouldReturn200() throws Exception {
        loanResponse.setStatus("SIGNED");
        when(jwtTokenProvider.getUserIdFromToken("valid-token")).thenReturn(1L);
        when(workflowService.sign(eq(1L), eq(1L), eq("base64sig"))).thenReturn(loanResponse);

        ApplicationSignRequest signRequest = new ApplicationSignRequest();
        signRequest.setSignatureData("base64sig");

        mockMvc.perform(post("/api/loans/1/sign")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SIGNED"));
    }

    @Test
    void signApplicationShouldReturn400WhenNoSignature() throws Exception {
        ApplicationSignRequest signRequest = new ApplicationSignRequest();

        mockMvc.perform(post("/api/loans/1/sign")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getHistoryShouldReturn200() throws Exception {
        StatusHistoryResponse h = new StatusHistoryResponse();
        h.setId(1L);
        h.setFromStatus("DRAFT");
        h.setToStatus("SUBMITTED");
        h.setCreatedAt(Instant.now());
        when(workflowService.getHistory(1L)).thenReturn(List.of(h));

        mockMvc.perform(get("/api/loans/1/history")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fromStatus").value("DRAFT"));
    }
}
