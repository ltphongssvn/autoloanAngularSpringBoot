package com.autoloan.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autoloan.backend.dto.loan.LoanApplicationRequest;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.Vehicle;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.repository.ApplicationRepository;
import com.autoloan.backend.repository.VehicleRepository;

@Service
public class LoanService {

    private final ApplicationRepository applicationRepository;
    private final VehicleRepository vehicleRepository;

    public LoanService(ApplicationRepository applicationRepository,
                       VehicleRepository vehicleRepository) {
        this.applicationRepository = applicationRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public LoanApplicationResponse createApplication(Long userId, LoanApplicationRequest request) {
        Application app = new Application();
        app.setApplicationNumber("APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        app.setUserId(userId);
        app.setStatus(ApplicationStatus.DRAFT);
        app.setCurrentStep(1);
        app.setDob(request.getDob());
        app.setLoanAmount(request.getLoanAmount());
        app.setDownPayment(request.getDownPayment());
        app.setLoanTerm(request.getLoanTerm());

        Application saved = applicationRepository.save(app);

        Vehicle vehicle = new Vehicle();
        vehicle.setApplicationId(saved.getId());
        vehicle.setMake(request.getVehicleMake());
        vehicle.setModel(request.getVehicleModel());
        vehicle.setYear(request.getVehicleYear());
        vehicle.setTrim(request.getVehicleTrim());
        vehicle.setVin(request.getVehicleVin());
        vehicle.setMileage(request.getVehicleMileage());
        vehicle.setCondition(request.getVehicleCondition());
        vehicle.setEstimatedValue(request.getVehicleEstimatedValue());

        vehicleRepository.save(vehicle);

        return toResponse(saved, vehicle);
    }

    public LoanApplicationResponse getApplication(Long applicationId, Long userId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found");
        }

        Vehicle vehicle = vehicleRepository.findByApplicationId(applicationId).orElse(null);
        return toResponse(app, vehicle);
    }

    public LoanApplicationResponse getApplicationById(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        Vehicle vehicle = vehicleRepository.findByApplicationId(applicationId).orElse(null);
        return toResponse(app, vehicle);
    }

    public List<LoanApplicationResponse> getUserApplications(Long userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(app -> {
                    Vehicle vehicle = vehicleRepository.findByApplicationId(app.getId()).orElse(null);
                    return toResponse(app, vehicle);
                })
                .toList();
    }

    public List<LoanApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(app -> {
                    Vehicle vehicle = vehicleRepository.findByApplicationId(app.getId()).orElse(null);
                    return toResponse(app, vehicle);
                })
                .toList();
    }

    @Transactional
    public LoanApplicationResponse updateApplication(Long applicationId, Long userId, LoanApplicationRequest request) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found");
        }

        if (app.getStatus() != ApplicationStatus.DRAFT) {
            throw new BadRequestException("Only draft applications can be updated");
        }

        if (request.getDob() != null) app.setDob(request.getDob());
        if (request.getLoanAmount() != null) app.setLoanAmount(request.getLoanAmount());
        if (request.getDownPayment() != null) app.setDownPayment(request.getDownPayment());
        if (request.getLoanTerm() != null) app.setLoanTerm(request.getLoanTerm());

        Application saved = applicationRepository.save(app);

        Vehicle vehicle = vehicleRepository.findByApplicationId(applicationId).orElse(null);
        if (vehicle != null) {
            if (request.getVehicleMake() != null) vehicle.setMake(request.getVehicleMake());
            if (request.getVehicleModel() != null) vehicle.setModel(request.getVehicleModel());
            if (request.getVehicleYear() != null) vehicle.setYear(request.getVehicleYear());
            if (request.getVehicleTrim() != null) vehicle.setTrim(request.getVehicleTrim());
            if (request.getVehicleVin() != null) vehicle.setVin(request.getVehicleVin());
            vehicleRepository.save(vehicle);
        }

        return toResponse(saved, vehicle);
    }

    @Transactional
    public void deleteApplication(Long applicationId, Long userId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found");
        }

        if (app.getStatus() != ApplicationStatus.DRAFT) {
            throw new BadRequestException("Only draft applications can be deleted");
        }

        applicationRepository.delete(app);
    }

    @Transactional
    public LoanApplicationResponse submitApplication(Long applicationId, Long userId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found");
        }

        if (app.getStatus() != ApplicationStatus.DRAFT) {
            throw new BadRequestException("Only draft applications can be submitted");
        }

        app.setStatus(ApplicationStatus.SUBMITTED);
        app.setSubmittedAt(Instant.now());
        Application saved = applicationRepository.save(app);

        Vehicle vehicle = vehicleRepository.findByApplicationId(applicationId).orElse(null);
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
}
