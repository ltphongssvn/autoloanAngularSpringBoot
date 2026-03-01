// backend/src/main/java/com/autoloan/backend/service/ApplicationWorkflowService.java
package com.autoloan.backend.service;

import com.autoloan.backend.dto.application.ApplicationApprovalRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.StatusHistory;
import com.autoloan.backend.model.Vehicle;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.repository.ApplicationRepository;
import com.autoloan.backend.repository.StatusHistoryRepository;
import com.autoloan.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ApplicationWorkflowService {

    private final ApplicationRepository applicationRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final VehicleRepository vehicleRepository;

    public ApplicationWorkflowService(ApplicationRepository applicationRepository,
                                       StatusHistoryRepository statusHistoryRepository,
                                       VehicleRepository vehicleRepository) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public LoanApplicationResponse updateStatus(Long applicationId, Long userId,
                                                 String status, String comment) {
        Application app = getApplication(applicationId);
        ApplicationStatus newStatus;
        try {
            newStatus = ApplicationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }

        if (app.getStatus() == newStatus) {
            throw new BadRequestException("Application is already in status " + status);
        }

        if (newStatus == ApplicationStatus.APPROVED || newStatus == ApplicationStatus.REJECTED) {
            app.setDecidedAt(Instant.now());
        }

        return transition(app, newStatus, userId,
                comment != null ? comment : "Status updated to " + newStatus.name());
    }

    @Transactional
    public LoanApplicationResponse startVerification(Long applicationId, Long userId) {
        Application app = getApplication(applicationId);
        validateStatus(app, ApplicationStatus.SUBMITTED);
        return transition(app, ApplicationStatus.UNDER_REVIEW, userId, "Verification started");
    }

    @Transactional
    public LoanApplicationResponse moveToReview(Long applicationId, Long userId) {
        Application app = getApplication(applicationId);
        if (app.getStatus() != ApplicationStatus.UNDER_REVIEW
                && app.getStatus() != ApplicationStatus.PENDING_DOCUMENTS) {
            throw new BadRequestException("Application must be under review or pending documents");
        }
        return transition(app, ApplicationStatus.UNDER_REVIEW, userId, "Moved to review");
    }

    @Transactional
    public LoanApplicationResponse requestDocuments(Long applicationId, Long userId) {
        Application app = getApplication(applicationId);
        if (app.getStatus() != ApplicationStatus.SUBMITTED
                && app.getStatus() != ApplicationStatus.UNDER_REVIEW) {
            throw new BadRequestException("Application must be submitted or under review");
        }
        return transition(app, ApplicationStatus.PENDING_DOCUMENTS, userId, "Documents requested");
    }

    @Transactional
    public LoanApplicationResponse approve(Long applicationId, Long userId,
                                            ApplicationApprovalRequest request) {
        Application app = getApplication(applicationId);
        if (app.getStatus() != ApplicationStatus.UNDER_REVIEW
                && app.getStatus() != ApplicationStatus.SUBMITTED) {
            throw new BadRequestException("Application must be under review or submitted");
        }

        if (request != null) {
            if (request.getLoanTerm() != null) app.setLoanTerm(request.getLoanTerm());
            if (request.getInterestRate() != null) app.setInterestRate(request.getInterestRate());
            if (request.getMonthlyPayment() != null) app.setMonthlyPayment(request.getMonthlyPayment());
        }

        app.setDecidedAt(Instant.now());
        return transition(app, ApplicationStatus.APPROVED, userId, "Application approved");
    }

    @Transactional
    public LoanApplicationResponse reject(Long applicationId, Long userId, String reason) {
        Application app = getApplication(applicationId);
        if (app.getStatus() != ApplicationStatus.UNDER_REVIEW
                && app.getStatus() != ApplicationStatus.SUBMITTED) {
            throw new BadRequestException("Application must be under review or submitted");
        }

        app.setRejectionReason(reason);
        app.setDecidedAt(Instant.now());
        return transition(app, ApplicationStatus.REJECTED, userId,
                reason != null ? "Rejected: " + reason : "Application rejected");
    }

    @Transactional
    public LoanApplicationResponse sign(Long applicationId, Long userId, String signatureData) {
        Application app = getApplication(applicationId);
        validateStatus(app, ApplicationStatus.APPROVED);

        if (!app.getUserId().equals(userId)) {
            throw new BadRequestException("Only the applicant can sign the application");
        }

        app.setSignatureData(signatureData);
        app.setSignedAt(Instant.now());
        app.setAgreementAccepted(true);
        return transition(app, ApplicationStatus.SIGNED, userId, "Application signed");
    }

    public List<StatusHistoryResponse> getHistory(Long applicationId) {
        applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        return statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    private Application getApplication(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    private void validateStatus(Application app, ApplicationStatus expected) {
        if (app.getStatus() != expected) {
            throw new BadRequestException("Application status must be " + expected.name());
        }
    }

    private LoanApplicationResponse transition(Application app, ApplicationStatus newStatus,
                                                Long userId, String comment) {
        String fromStatus = app.getStatus().name();
        app.setStatus(newStatus);
        Application saved = applicationRepository.save(app);

        StatusHistory history = StatusHistory.builder()
                .applicationId(app.getId())
                .userId(userId)
                .fromStatus(fromStatus)
                .toStatus(newStatus.name())
                .comment(comment)
                .build();
        statusHistoryRepository.save(history);

        Vehicle vehicle = vehicleRepository.findByApplicationId(app.getId()).orElse(null);
        return toResponse(saved, vehicle);
    }

    private LoanApplicationResponse toResponse(Application app, Vehicle vehicle) {
        LoanApplicationResponse response = new LoanApplicationResponse();
        response.setId(app.getId());
        response.setApplicationNumber(app.getApplicationNumber());
        response.setStatus(app.getStatus().name());
        response.setCurrentStep(app.getCurrentStep());
        response.setDob(app.getDob());
        response.setLoanAmount(app.getLoanAmount());
        response.setDownPayment(app.getDownPayment());
        response.setLoanTerm(app.getLoanTerm());
        response.setInterestRate(app.getInterestRate());
        response.setMonthlyPayment(app.getMonthlyPayment());
        response.setRejectionReason(app.getRejectionReason());
        response.setUserId(app.getUserId());
        response.setSubmittedAt(app.getSubmittedAt());
        response.setDecidedAt(app.getDecidedAt());
        response.setCreatedAt(app.getCreatedAt());
        response.setUpdatedAt(app.getUpdatedAt());
        if (vehicle != null) {
            response.setVehicleMake(vehicle.getMake());
            response.setVehicleModel(vehicle.getModel());
            response.setVehicleYear(vehicle.getYear());
            response.setVehicleTrim(vehicle.getTrim());
            response.setVehicleVin(vehicle.getVin());
        }
        return response;
    }

    private StatusHistoryResponse toHistoryResponse(StatusHistory history) {
        StatusHistoryResponse response = new StatusHistoryResponse();
        response.setId(history.getId());
        response.setFromStatus(history.getFromStatus());
        response.setToStatus(history.getToStatus());
        response.setComment(history.getComment());
        response.setApplicationId(history.getApplicationId());
        response.setUserId(history.getUserId());
        response.setCreatedAt(history.getCreatedAt());
        return response;
    }
}
