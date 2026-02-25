package com.autoloan.backend.service;

import com.autoloan.backend.dto.application.ApplicationApprovalRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.StatusHistory;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.repository.ApplicationRepository;
import com.autoloan.backend.repository.StatusHistoryRepository;
import com.autoloan.backend.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationWorkflowServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private ApplicationWorkflowService workflowService;

    private Application testApp;

    @BeforeEach
    void setUp() {
        testApp = new Application();
        testApp.setId(1L);
        testApp.setUserId(100L);
        testApp.setApplicationNumber("APP-TEST1234");
        testApp.setStatus(ApplicationStatus.SUBMITTED);
        testApp.setCurrentStep(1);
    }

    private void mockSave() {
        when(applicationRepository.save(any(Application.class))).thenAnswer(inv -> inv.getArgument(0));
        when(statusHistoryRepository.save(any(StatusHistory.class))).thenAnswer(inv -> inv.getArgument(0));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.empty());
    }

    @Test
    void startVerification_success() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.startVerification(1L, 200L);

        assertEquals("UNDER_REVIEW", response.getStatus());
        verify(statusHistoryRepository).save(any(StatusHistory.class));
    }

    @Test
    void startVerification_wrongStatus() {
        testApp.setStatus(ApplicationStatus.DRAFT);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        assertThrows(BadRequestException.class, () -> workflowService.startVerification(1L, 200L));
    }

    @Test
    void startVerification_notFound() {
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> workflowService.startVerification(999L, 200L));
    }

    @Test
    void moveToReview_fromUnderReview() {
        testApp.setStatus(ApplicationStatus.UNDER_REVIEW);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.moveToReview(1L, 200L);

        assertEquals("UNDER_REVIEW", response.getStatus());
    }

    @Test
    void moveToReview_fromPendingDocuments() {
        testApp.setStatus(ApplicationStatus.PENDING_DOCUMENTS);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.moveToReview(1L, 200L);

        assertEquals("UNDER_REVIEW", response.getStatus());
    }

    @Test
    void moveToReview_wrongStatus() {
        testApp.setStatus(ApplicationStatus.DRAFT);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        assertThrows(BadRequestException.class, () -> workflowService.moveToReview(1L, 200L));
    }

    @Test
    void requestDocuments_fromSubmitted() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.requestDocuments(1L, 200L);

        assertEquals("PENDING_DOCUMENTS", response.getStatus());
    }

    @Test
    void requestDocuments_fromUnderReview() {
        testApp.setStatus(ApplicationStatus.UNDER_REVIEW);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.requestDocuments(1L, 200L);

        assertEquals("PENDING_DOCUMENTS", response.getStatus());
    }

    @Test
    void requestDocuments_wrongStatus() {
        testApp.setStatus(ApplicationStatus.APPROVED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        assertThrows(BadRequestException.class, () -> workflowService.requestDocuments(1L, 200L));
    }

    @Test
    void approve_success() {
        testApp.setStatus(ApplicationStatus.UNDER_REVIEW);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        ApplicationApprovalRequest request = new ApplicationApprovalRequest();
        request.setLoanTerm(60);
        request.setInterestRate(new BigDecimal("4.5"));
        request.setMonthlyPayment(new BigDecimal("450.00"));

        LoanApplicationResponse response = workflowService.approve(1L, 200L, request);

        assertEquals("APPROVED", response.getStatus());
        assertEquals(60, response.getLoanTerm());
    }

    @Test
    void approve_withNullRequest() {
        testApp.setStatus(ApplicationStatus.UNDER_REVIEW);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.approve(1L, 200L, null);

        assertEquals("APPROVED", response.getStatus());
    }

    @Test
    void approve_wrongStatus() {
        testApp.setStatus(ApplicationStatus.DRAFT);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        assertThrows(BadRequestException.class,
                () -> workflowService.approve(1L, 200L, new ApplicationApprovalRequest()));
    }

    @Test
    void reject_success() {
        testApp.setStatus(ApplicationStatus.UNDER_REVIEW);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.reject(1L, 200L, "Insufficient income");

        assertEquals("REJECTED", response.getStatus());
        assertEquals("Insufficient income", response.getRejectionReason());
    }

    @Test
    void reject_withNullReason() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.reject(1L, 200L, null);

        assertEquals("REJECTED", response.getStatus());
    }

    @Test
    void reject_wrongStatus() {
        testApp.setStatus(ApplicationStatus.APPROVED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        assertThrows(BadRequestException.class,
                () -> workflowService.reject(1L, 200L, "reason"));
    }

    @Test
    void sign_success() {
        testApp.setStatus(ApplicationStatus.APPROVED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));
        mockSave();

        LoanApplicationResponse response = workflowService.sign(1L, 100L, "base64sig");

        assertEquals("SIGNED", response.getStatus());
    }

    @Test
    void sign_wrongUser() {
        testApp.setStatus(ApplicationStatus.APPROVED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        assertThrows(BadRequestException.class,
                () -> workflowService.sign(1L, 999L, "base64sig"));
    }

    @Test
    void sign_wrongStatus() {
        testApp.setStatus(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        assertThrows(BadRequestException.class,
                () -> workflowService.sign(1L, 100L, "base64sig"));
    }

    @Test
    void getHistory_success() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApp));

        StatusHistory h = StatusHistory.builder()
                .id(1L).applicationId(1L).userId(200L)
                .fromStatus("SUBMITTED").toStatus("UNDER_REVIEW")
                .comment("Verification started").createdAt(Instant.now()).build();
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(h));

        List<StatusHistoryResponse> history = workflowService.getHistory(1L);

        assertEquals(1, history.size());
        assertEquals("SUBMITTED", history.get(0).getFromStatus());
        assertEquals("UNDER_REVIEW", history.get(0).getToStatus());
    }

    @Test
    void getHistory_applicationNotFound() {
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> workflowService.getHistory(999L));
    }
}
