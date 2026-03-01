package com.autoloan.backend.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autoloan.backend.dto.application.ApplicationDetailResponse;
import com.autoloan.backend.model.Address;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.Document;
import com.autoloan.backend.model.FinancialInfo;
import com.autoloan.backend.model.StatusHistory;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.Vehicle;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.model.enums.DocumentStatus;
import com.autoloan.backend.model.enums.DocumentType;
import com.autoloan.backend.model.enums.Role;
import com.autoloan.backend.repository.AddressRepository;
import com.autoloan.backend.repository.DocumentRepository;
import com.autoloan.backend.repository.FinancialInfoRepository;
import com.autoloan.backend.repository.StatusHistoryRepository;
import com.autoloan.backend.repository.UserRepository;
import com.autoloan.backend.repository.VehicleRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationSerializerTest {

    @Mock private UserRepository userRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private FinancialInfoRepository financialInfoRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private StatusHistoryRepository statusHistoryRepository;

    private ApplicationSerializer serializer;
    private Application app;
    private User user;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        serializer = new ApplicationSerializer(userRepository, vehicleRepository,
                addressRepository, financialInfoRepository, documentRepository, statusHistoryRepository);

        app = new Application();
        app.setId(1L);
        app.setApplicationNumber("APP-001");
        app.setStatus(ApplicationStatus.DRAFT);
        app.setCurrentStep(1);
        app.setUserId(10L);
        app.setLoanAmount(new BigDecimal("25000"));
        app.setDownPayment(new BigDecimal("5000"));
        app.setLoanTerm(36);
        app.setDob(LocalDate.of(1990, 1, 15));
        app.setCreatedAt(Instant.now());
        app.setUpdatedAt(Instant.now());

        user = new User();
        user.setId(10L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john@example.com");
        user.setPhone("555-1234");
        user.setRole(Role.CUSTOMER);

        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setApplicationId(1L);
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2024);
        vehicle.setVin("VIN123");
        vehicle.setTrim("LE");
        vehicle.setCondition("new");
        vehicle.setEstimatedValue(new BigDecimal("30000"));
        vehicle.setMileage(0);
    }

    private void stubRepos() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(vehicle));
        when(addressRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(financialInfoRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
    }

    @Test
    void serializeShouldReturnBasicFields() {
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals(1L, resp.getId());
        assertEquals("APP-001", resp.getApplicationNumber());
        assertEquals("DRAFT", resp.getStatus());
        assertEquals(1, resp.getCurrentStep());
        assertEquals(new BigDecimal("25000"), resp.getLoanAmount());
    }

    @Test
    void serializeShouldBuildLinksForDraft() {
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("/api/loans/1", resp.getLinks().get("self"));
        assertEquals("/api/loans/1/documents", resp.getLinks().get("documents"));
        assertEquals("/api/loans/1/submit", resp.getLinks().get("submit"));
        assertNull(resp.getLinks().get("sign"));
    }

    @Test
    void serializeShouldBuildLinksForApproved() {
        app.setStatus(ApplicationStatus.APPROVED);
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("/api/loans/1/sign", resp.getLinks().get("sign"));
        assertEquals("/api/loans/1/agreement_pdf", resp.getLinks().get("agreement_pdf"));
        assertNull(resp.getLinks().get("submit"));
    }

    @Test
    void serializeShouldBuildPersonalInfoWithUser() {
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("John", resp.getPersonalInfo().get("first_name"));
        assertEquals("Doe", resp.getPersonalInfo().get("last_name"));
        assertEquals("john@example.com", resp.getPersonalInfo().get("email"));
        assertEquals("555-1234", resp.getPersonalInfo().get("phone"));
    }

    @Test
    void serializeShouldHideSsnForNonOwner() {
        app.setSsnEncrypted("123-45-6789");
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 99L);

        assertNull(resp.getPersonalInfo().get("ssn"));
    }

    @Test
    void serializeShouldShowSsnForOwner() {
        app.setSsnEncrypted("123-45-6789");
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("123-45-6789", resp.getPersonalInfo().get("ssn"));
    }

    @Test
    void serializeShouldBuildCarDetails() {
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("Toyota", resp.getCarDetails().get("make"));
        assertEquals("Camry", resp.getCarDetails().get("model"));
        assertEquals("2024", resp.getCarDetails().get("year"));
        assertEquals("VIN123", resp.getCarDetails().get("vin"));
        assertEquals("LE", resp.getCarDetails().get("trim"));
        assertEquals("new", resp.getCarDetails().get("condition"));
        assertEquals("30000", resp.getCarDetails().get("price"));
        assertEquals("0", resp.getCarDetails().get("mileage"));
    }

    @Test
    void serializeShouldHandleNullVehicle() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.empty());
        when(addressRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(financialInfoRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ApplicationDetailResponse resp = serializer.serialize(app, 10L);
        assertTrue(resp.getCarDetails().isEmpty());
    }

    @Test
    void serializeShouldBuildLoanDetails() {
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("25000", resp.getLoanDetails().get("amount"));
        assertEquals("5000", resp.getLoanDetails().get("down_payment"));
    }

    @Test
    void serializeShouldBuildAddressInfo() {
        Address addr = new Address();
        addr.setAddressType("residential");
        addr.setStreetAddress("123 Main St");
        addr.setCity("Springfield");
        addr.setState("IL");
        addr.setZipCode("62704");
        addr.setYearsAtAddress(3);
        addr.setMonthsAtAddress(6);

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(vehicle));
        when(addressRepository.findByApplicationId(1L)).thenReturn(List.of(addr));
        when(financialInfoRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("123 Main St", resp.getPersonalInfo().get("address"));
        assertEquals("Springfield", resp.getPersonalInfo().get("city"));
        assertEquals("IL", resp.getPersonalInfo().get("state"));
        assertEquals("62704", resp.getPersonalInfo().get("zip"));
        assertEquals("3", resp.getPersonalInfo().get("years_at_address"));
        assertEquals("6", resp.getPersonalInfo().get("months_at_address"));
    }

    @Test
    void serializeShouldBuildEmploymentInfo() {
        FinancialInfo fi = new FinancialInfo();
        fi.setIncomeType("primary");
        fi.setEmployerName("Acme Corp");
        fi.setJobTitle("Engineer");
        fi.setEmploymentStatus("employed");
        fi.setYearsEmployed(5);
        fi.setMonthsEmployed(3);
        fi.setAnnualIncome(new BigDecimal("80000"));
        fi.setMonthlyExpenses(new BigDecimal("2000"));
        fi.setCreditScore(720);
        fi.setOtherIncome(new BigDecimal("500"));

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(vehicle));
        when(addressRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(financialInfoRepository.findByApplicationId(1L)).thenReturn(List.of(fi));
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals("Acme Corp", resp.getEmploymentInfo().get("employer"));
        assertEquals("Engineer", resp.getEmploymentInfo().get("job_title"));
        assertEquals("80000", resp.getEmploymentInfo().get("income"));
        assertEquals("720", resp.getEmploymentInfo().get("credit_score"));
    }

    @Test
    void serializeShouldHandleNoEmploymentInfo() {
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);
        assertTrue(resp.getEmploymentInfo().isEmpty());
    }

    @Test
    void serializeShouldBuildDocuments() {
        Document doc = new Document();
        doc.setId(5L);
        doc.setDocType(DocumentType.DRIVERS_LICENSE);
        doc.setFileName("license.pdf");
        doc.setStatus(DocumentStatus.UPLOADED);
        doc.setCreatedAt(Instant.now());

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(vehicle));
        when(addressRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(financialInfoRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of(doc));
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals(1, resp.getDocuments().size());
        assertEquals(5L, resp.getDocuments().get(0).get("id"));
        assertEquals(DocumentType.DRIVERS_LICENSE, resp.getDocuments().get(0).get("docType"));
    }

    @Test
    void serializeShouldBuildStatusHistories() {
        StatusHistory h = StatusHistory.builder()
                .id(1L).fromStatus("DRAFT").toStatus("SUBMITTED")
                .comment("Submitted").userId(10L).build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(vehicle));
        when(addressRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(financialInfoRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(h));

        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertEquals(1, resp.getStatusHistories().size());
        assertEquals("DRAFT", resp.getStatusHistories().get(0).get("fromStatus"));
        assertEquals("SUBMITTED", resp.getStatusHistories().get(0).get("toStatus"));
    }

    @Test
    void serializeShouldHandleNullUser() {
        when(userRepository.findById(10L)).thenReturn(Optional.empty());
        when(vehicleRepository.findByApplicationId(1L)).thenReturn(Optional.of(vehicle));
        when(addressRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(financialInfoRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of());
        when(statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertNull(resp.getPersonalInfo().get("first_name"));
        assertNull(resp.getPersonalInfo().get("email"));
    }

    @Test
    void serializeShouldHandleNullCurrentUserId() {
        stubRepos();
        app.setSsnEncrypted("123-45-6789");
        ApplicationDetailResponse resp = serializer.serialize(app, null);

        assertNull(resp.getPersonalInfo().get("ssn"));
    }

    @Test
    void serializeShouldHandleNullDob() {
        app.setDob(null);
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertNull(resp.getDob());
        assertNull(resp.getPersonalInfo().get("dob"));
    }

    @Test
    void serializeShouldHandleNullLoanAmounts() {
        app.setLoanAmount(null);
        app.setDownPayment(null);
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertNull(resp.getLoanDetails().get("amount"));
        assertNull(resp.getLoanDetails().get("down_payment"));
    }

    @Test
    void serializeShouldBuildLinksForSubmittedStatus() {
        app.setStatus(ApplicationStatus.SUBMITTED);
        stubRepos();
        ApplicationDetailResponse resp = serializer.serialize(app, 10L);

        assertNull(resp.getLinks().get("submit"));
        assertNull(resp.getLinks().get("sign"));
        assertEquals("/api/loans/1", resp.getLinks().get("self"));
    }
}
