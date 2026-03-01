// backend/src/main/java/com/autoloan/backend/service/ApplicationSerializer.java
package com.autoloan.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.autoloan.backend.dto.application.ApplicationDetailResponse;
import com.autoloan.backend.model.Address;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.Document;
import com.autoloan.backend.model.FinancialInfo;
import com.autoloan.backend.model.StatusHistory;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.Vehicle;
import com.autoloan.backend.repository.AddressRepository;
import com.autoloan.backend.repository.DocumentRepository;
import com.autoloan.backend.repository.FinancialInfoRepository;
import com.autoloan.backend.repository.StatusHistoryRepository;
import com.autoloan.backend.repository.UserRepository;
import com.autoloan.backend.repository.VehicleRepository;

@Service
public class ApplicationSerializer {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final AddressRepository addressRepository;
    private final FinancialInfoRepository financialInfoRepository;
    private final DocumentRepository documentRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    public ApplicationSerializer(UserRepository userRepository,
                                  VehicleRepository vehicleRepository,
                                  AddressRepository addressRepository,
                                  FinancialInfoRepository financialInfoRepository,
                                  DocumentRepository documentRepository,
                                  StatusHistoryRepository statusHistoryRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.addressRepository = addressRepository;
        this.financialInfoRepository = financialInfoRepository;
        this.documentRepository = documentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    public ApplicationDetailResponse serialize(Application app, Long currentUserId) {
        boolean isOwner = currentUserId != null && currentUserId.equals(app.getUserId());

        User user = userRepository.findById(app.getUserId()).orElse(null);
        Vehicle vehicle = vehicleRepository.findByApplicationId(app.getId()).orElse(null);
        List<Address> addresses = addressRepository.findByApplicationId(app.getId());
        List<FinancialInfo> financialInfos = financialInfoRepository.findByApplicationId(app.getId());
        List<Document> documents = documentRepository.findByApplicationId(app.getId());
        List<StatusHistory> histories = statusHistoryRepository.findByApplicationIdOrderByCreatedAtDesc(app.getId());

        ApplicationDetailResponse response = new ApplicationDetailResponse();
        response.setId(app.getId());
        response.setApplicationNumber(app.getApplicationNumber());
        response.setStatus(app.getStatus().name());
        response.setCurrentStep(app.getCurrentStep());
        response.setLoanTerm(app.getLoanTerm());
        response.setInterestRate(app.getInterestRate());
        response.setMonthlyPayment(app.getMonthlyPayment());
        response.setLoanAmount(app.getLoanAmount());
        response.setDownPayment(app.getDownPayment());
        response.setDob(app.getDob() != null ? app.getDob().toString() : null);
        response.setSubmittedAt(app.getSubmittedAt());
        response.setDecidedAt(app.getDecidedAt());
        response.setSignatureData(app.getSignatureData());
        response.setSignedAt(app.getSignedAt());
        response.setAgreementAccepted(app.getAgreementAccepted());
        response.setCreatedAt(app.getCreatedAt());
        response.setUpdatedAt(app.getUpdatedAt());

        response.setLinks(buildLinks(app));
        response.setPersonalInfo(buildPersonalInfo(user, app, addresses, isOwner));
        response.setCarDetails(buildCarDetails(vehicle));
        response.setLoanDetails(buildLoanDetails(app));
        response.setEmploymentInfo(buildEmploymentInfo(financialInfos));
        response.setDocuments(buildDocuments(documents));
        response.setStatusHistories(buildStatusHistories(histories));

        return response;
    }

    private Map<String, String> buildLinks(Application app) {
        String baseUrl = "/api/loans/" + app.getId();
        Map<String, String> links = new HashMap<>();
        links.put("self", baseUrl);
        links.put("documents", baseUrl + "/documents");
        if ("DRAFT".equals(app.getStatus().name())) {
            links.put("submit", baseUrl + "/submit");
        }
        if ("APPROVED".equals(app.getStatus().name())) {
            links.put("sign", baseUrl + "/sign");
            links.put("agreement_pdf", baseUrl + "/agreement_pdf");
        }
        return links;
    }

    private Map<String, String> buildPersonalInfo(User user, Application app,
                                                    List<Address> addresses, boolean isOwner) {
        Address residential = addresses.stream()
                .filter(a -> "residential".equals(a.getAddressType()))
                .findFirst().orElse(null);

        Map<String, String> info = new HashMap<>();
        info.put("first_name", user != null ? user.getFirstName() : null);
        info.put("last_name", user != null ? user.getLastName() : null);
        info.put("email", user != null ? user.getEmail() : null);
        info.put("phone", user != null ? user.getPhone() : null);
        info.put("dob", app.getDob() != null ? app.getDob().toString() : null);
        info.put("ssn", isOwner ? app.getSsnEncrypted() : null);
        info.put("address", residential != null ? residential.getStreetAddress() : null);
        info.put("city", residential != null ? residential.getCity() : null);
        info.put("state", residential != null ? residential.getState() : null);
        info.put("zip", residential != null ? residential.getZipCode() : null);
        info.put("years_at_address", residential != null && residential.getYearsAtAddress() != null
                ? residential.getYearsAtAddress().toString() : null);
        info.put("months_at_address", residential != null && residential.getMonthsAtAddress() != null
                ? residential.getMonthsAtAddress().toString() : null);
        return info;
    }

    private Map<String, String> buildCarDetails(Vehicle vehicle) {
        Map<String, String> details = new HashMap<>();
        if (vehicle == null) return details;
        details.put("make", vehicle.getMake());
        details.put("model", vehicle.getModel());
        details.put("year", String.valueOf(vehicle.getYear()));
        details.put("vin", vehicle.getVin());
        details.put("trim", vehicle.getTrim());
        details.put("condition", vehicle.getCondition());
        details.put("price", vehicle.getEstimatedValue() != null ? vehicle.getEstimatedValue().toString() : null);
        details.put("mileage", vehicle.getMileage() != null ? vehicle.getMileage().toString() : null);
        return details;
    }

    private Map<String, String> buildLoanDetails(Application app) {
        Map<String, String> details = new HashMap<>();
        details.put("amount", app.getLoanAmount() != null ? app.getLoanAmount().toString() : null);
        details.put("down_payment", app.getDownPayment() != null ? app.getDownPayment().toString() : null);
        return details;
    }

    private Map<String, String> buildEmploymentInfo(List<FinancialInfo> financialInfos) {
        Map<String, String> info = new HashMap<>();
        FinancialInfo primary = financialInfos.stream()
                .filter(f -> "primary".equals(f.getIncomeType()))
                .findFirst().orElse(null);
        if (primary == null) return info;
        info.put("employer", primary.getEmployerName());
        info.put("job_title", primary.getJobTitle());
        info.put("employment_status", primary.getEmploymentStatus());
        info.put("years", primary.getYearsEmployed() != null ? primary.getYearsEmployed().toString() : null);
        info.put("months_employed", primary.getMonthsEmployed() != null ? primary.getMonthsEmployed().toString() : null);
        info.put("income", primary.getAnnualIncome() != null ? primary.getAnnualIncome().toString() : null);
        info.put("expenses", primary.getMonthlyExpenses() != null ? primary.getMonthlyExpenses().toString() : null);
        info.put("credit_score", primary.getCreditScore() != null ? primary.getCreditScore().toString() : null);
        info.put("other_income", primary.getOtherIncome() != null ? primary.getOtherIncome().toString() : null);
        return info;
    }

    private List<Map<String, Object>> buildDocuments(List<Document> documents) {
        return documents.stream().map(d -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("docType", d.getDocType());
            map.put("fileName", d.getFileName());
            map.put("status", d.getStatus());
            map.put("createdAt", d.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildStatusHistories(List<StatusHistory> histories) {
        return histories.stream().map(h -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", h.getId());
            map.put("fromStatus", h.getFromStatus());
            map.put("toStatus", h.getToStatus());
            map.put("comment", h.getComment());
            map.put("userId", h.getUserId());
            map.put("createdAt", h.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }
}
