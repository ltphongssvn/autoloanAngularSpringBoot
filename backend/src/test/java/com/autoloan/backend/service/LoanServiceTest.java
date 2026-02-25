package com.autoloan.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autoloan.backend.dto.loan.LoanApplicationRequest;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.Vehicle;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.repository.ApplicationRepository;
import com.autoloan.backend.repository.VehicleRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private LoanService loanService;

    private LoanApplicationRequest request;
    private Application existingApp;
    private Vehicle existingVehicle;

    @BeforeEach
    void setUp() {
        request = new LoanApplicationRequest();
        request.setLoanAmount(new BigDecimal("25000.00"));
        request.setDownPayment(new BigDecimal("5000.00"));
        request.setLoanTerm(36);
        request.setVehicleMake("Toyota");
        request.setVehicleModel("Camry");
        request.setVehicleYear(2024);

        existingApp = new Application();
        existingApp.setId(1L);
        existingApp.setApplicationNumber("APP-12345678");
        existingApp.setUserId(1L);
        existingApp.setStatus(ApplicationStatus.DRAFT);
        existingApp.setCurrentStep(1);
        existingApp.setLoanAmount(new BigDecimal("25000.00"));

        existingVehicle = new Vehicle();
        existingVehicle.setId(1L);
        existingVehicle.setApplicationId(1L);
        existingVehicle.setMake("Toyota");
        existingVehicle.setModel("Camry");
        existingVehicle.setYear(2024);
    }

    @Test
    void createApplicationShouldSaveAndReturn() {
        when(applicationRepository.save(any(Application.class))).thenAnswer(inv -> {
            Application a = inv.getArgument(0);
            a.setId(1L);
            return a;
        });
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(existingVehicle);

        LoanApplicationResponse response = loanService.createApplication(1L, request);

        assertNotNull(response.getApplicationNumber());
        assertTrue(response.getApplicationNumber().startsWith("APP-"));
        assertEquals("DRAFT", response.getStatus());
        assertEquals("Toyota", response.getVehicleMake());
        verify(applicationRepository).save(any(Application.class));
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void getApplicationShouldReturnForOwner() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(existingVehicle));

        LoanApplicationResponse response = loanService.getApplication(1L, 1L);

        assertEquals(1L, response.getId());
        assertEquals("Toyota", response.getVehicleMake());
    }

    @Test
    void getApplicationShouldThrowWhenNotOwner() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.getApplication(1L, 99L));
    }

    @Test
    void getApplicationShouldThrowWhenNotFound() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.getApplication(99L, 1L));
    }

    @Test
    void getApplicationByIdShouldReturn() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(existingVehicle));

        LoanApplicationResponse response = loanService.getApplicationById(1L);

        assertEquals(1L, response.getId());
        assertEquals("Toyota", response.getVehicleMake());
    }

    @Test
    void getApplicationByIdShouldThrowWhenNotFound() {
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.getApplicationById(999L));
    }

    @Test
    void getUserApplicationsShouldReturnList() {
        when(applicationRepository.findByUserId(1L)).thenReturn(List.of(existingApp));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(existingVehicle));

        List<LoanApplicationResponse> responses = loanService.getUserApplications(1L);

        assertEquals(1, responses.size());
        assertEquals("APP-12345678", responses.get(0).getApplicationNumber());
    }

    @Test
    void getAllApplicationsShouldReturnAll() {
        when(applicationRepository.findAll()).thenReturn(List.of(existingApp));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(existingVehicle));

        List<LoanApplicationResponse> responses = loanService.getAllApplications();

        assertEquals(1, responses.size());
        assertEquals("APP-12345678", responses.get(0).getApplicationNumber());
    }

    @Test
    void updateApplicationShouldUpdate() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));
        when(applicationRepository.save(any(Application.class))).thenReturn(existingApp);
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(existingVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(existingVehicle);

        LoanApplicationRequest updateReq = new LoanApplicationRequest();
        updateReq.setLoanAmount(new BigDecimal("30000.00"));
        updateReq.setDownPayment(new BigDecimal("5000.00"));
        updateReq.setLoanTerm(48);
        updateReq.setVehicleMake("Honda");
        updateReq.setVehicleModel("Accord");
        updateReq.setVehicleYear(2024);

        LoanApplicationResponse response = loanService.updateApplication(1L, 1L, updateReq);

        assertNotNull(response);
        verify(applicationRepository).save(any(Application.class));
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void updateApplicationShouldThrowWhenNotOwner() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.updateApplication(1L, 99L, request));
    }

    @Test
    void updateApplicationShouldThrowWhenNotDraft() {
        existingApp.setStatus(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        assertThrows(BadRequestException.class,
                () -> loanService.updateApplication(1L, 1L, request));
    }

    @Test
    void updateApplicationShouldThrowWhenNotFound() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.updateApplication(99L, 1L, request));
    }

    @Test
    void deleteApplicationShouldDelete() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        loanService.deleteApplication(1L, 1L);

        verify(applicationRepository).delete(existingApp);
    }

    @Test
    void deleteApplicationShouldThrowWhenNotOwner() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.deleteApplication(1L, 99L));
    }

    @Test
    void deleteApplicationShouldThrowWhenNotDraft() {
        existingApp.setStatus(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        assertThrows(BadRequestException.class,
                () -> loanService.deleteApplication(1L, 1L));
    }

    @Test
    void deleteApplicationShouldThrowWhenNotFound() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.deleteApplication(99L, 1L));
    }

    @Test
    void submitApplicationShouldChangeStatus() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));
        when(applicationRepository.save(any(Application.class))).thenReturn(existingApp);
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(existingVehicle));

        LoanApplicationResponse response = loanService.submitApplication(1L, 1L);

        assertEquals(ApplicationStatus.SUBMITTED.name(), response.getStatus());
        verify(applicationRepository).save(existingApp);
    }

    @Test
    void submitApplicationShouldThrowWhenNotDraft() {
        existingApp.setStatus(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        assertThrows(BadRequestException.class,
                () -> loanService.submitApplication(1L, 1L));
    }

    @Test
    void submitApplicationShouldThrowWhenNotOwner() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));

        assertThrows(ResourceNotFoundException.class,
                () -> loanService.submitApplication(1L, 99L));
    }
}
