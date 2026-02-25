// backend/src/test/java/com/autoloan/backend/service/AgreementPdfServiceTest.java
package com.autoloan.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Address;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.Vehicle;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.model.enums.Role;
import com.autoloan.backend.repository.ApplicationRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgreementPdfServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    private AgreementPdfService pdfService;

    private Application app;
    private User user;

    @BeforeEach
    void setUp() {
        pdfService = new AgreementPdfService(applicationRepository);

        user = new User();
        user.setId(1L);
        user.setEmail("john@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPhone("555-1234");
        user.setEncryptedPassword("encoded");
        user.setRole(Role.CUSTOMER);

        Address address = new Address();
        address.setAddressType("residential");
        address.setStreetAddress("123 Main St");
        address.setCity("Springfield");
        address.setState("IL");
        address.setZipCode("62701");

        Vehicle vehicle = new Vehicle();
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2024);
        vehicle.setVin("1HGBH41JXMN109186");

        app = new Application();
        app.setId(1L);
        app.setApplicationNumber("APP-0001");
        app.setStatus(ApplicationStatus.APPROVED);
        app.setUserId(1L);
        app.setUser(user);
        app.setLoanAmount(new BigDecimal("25000.00"));
        app.setDownPayment(new BigDecimal("5000.00"));
        app.setInterestRate(new BigDecimal("6.90"));
        app.setLoanTerm(48);
        app.setMonthlyPayment(new BigDecimal("478.23"));
        app.setAddresses(new ArrayList<>(List.of(address)));
        app.setVehicles(new ArrayList<>(List.of(vehicle)));
        app.setFinancialInfos(new ArrayList<>());
        app.setDocuments(new ArrayList<>());
        app.setNotes(new ArrayList<>());
        app.setStatusHistories(new ArrayList<>());
    }

    // ==================== generate ====================

    @Test
    void generateShouldReturnPdfForApprovedAppAsCustomer() {
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 1L, "CUSTOMER");

        assertNotNull(result.getBuffer());
        assertTrue(result.getBuffer().length > 0);
        assertEquals("loan_agreement_APP-0001.pdf", result.getFilename());
    }

    @Test
    void generateShouldReturnPdfForSignedApp() {
        app.setStatus(ApplicationStatus.SIGNED);
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 1L, "CUSTOMER");

        assertNotNull(result.getBuffer());
        assertTrue(result.getBuffer().length > 0);
    }

    @Test
    void generateShouldReturnPdfForStaffWithoutOwnership() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 99L, "LOAN_OFFICER");

        assertNotNull(result.getBuffer());
        assertTrue(result.getBuffer().length > 0);
    }

    @Test
    void generateShouldReturnPdfForUnderwriter() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 99L, "UNDERWRITER");

        assertNotNull(result.getBuffer());
    }

    @Test
    void generateShouldThrowWhenAppNotFoundAsCustomer() {
        when(applicationRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> pdfService.generate(99L, 1L, "CUSTOMER"));
    }

    @Test
    void generateShouldThrowWhenAppNotFoundAsStaff() {
        when(applicationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> pdfService.generate(99L, 1L, "LOAN_OFFICER"));
    }

    @Test
    void generateShouldThrowWhenStatusIsDraft() {
        app.setStatus(ApplicationStatus.DRAFT);
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        assertThrows(BadRequestException.class, () -> pdfService.generate(1L, 1L, "CUSTOMER"));
    }

    @Test
    void generateShouldThrowWhenStatusIsSubmitted() {
        app.setStatus(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        assertThrows(BadRequestException.class, () -> pdfService.generate(1L, 1L, "CUSTOMER"));
    }

    @Test
    void generateShouldUseDefaultAppNumberWhenNull() {
        app.setApplicationNumber(null);
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 1L, "CUSTOMER");

        assertEquals("loan_agreement_APP-0001.pdf", result.getFilename());
    }

    // ==================== buildPdf edge cases ====================

    @Test
    void buildPdfShouldHandleNoAddressesOrVehicles() {
        app.setAddresses(new ArrayList<>());
        app.setVehicles(new ArrayList<>());
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 1L, "CUSTOMER");

        assertNotNull(result.getBuffer());
        assertTrue(result.getBuffer().length > 0);
    }

    @Test
    void buildPdfShouldHandleNullLoanFields() {
        app.setLoanAmount(null);
        app.setDownPayment(null);
        app.setInterestRate(null);
        app.setLoanTerm(null);
        app.setMonthlyPayment(null);
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 1L, "CUSTOMER");

        assertNotNull(result.getBuffer());
    }

    @Test
    void buildPdfShouldHandleNullUser() {
        app.setUser(null);
        when(applicationRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(app));

        AgreementPdfService.PdfResult result = pdfService.generate(1L, 1L, "CUSTOMER");

        assertNotNull(result.getBuffer());
    }

    @Test
    void pdfResultShouldExposeBufferAndFilename() {
        byte[] data = new byte[]{1, 2, 3};
        AgreementPdfService.PdfResult result = new AgreementPdfService.PdfResult(data, "test.pdf");

        assertArrayEquals(data, result.getBuffer());
        assertEquals("test.pdf", result.getFilename());
    }
}
