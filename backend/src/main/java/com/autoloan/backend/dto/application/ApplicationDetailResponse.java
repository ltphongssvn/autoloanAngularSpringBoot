// backend/src/main/java/com/autoloan/backend/dto/application/ApplicationDetailResponse.java
package com.autoloan.backend.dto.application;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailResponse {
    private Long id;
    private String applicationNumber;
    private String status;
    private Integer currentStep;
    private Integer loanTerm;
    private BigDecimal interestRate;
    private BigDecimal monthlyPayment;
    private BigDecimal loanAmount;
    private BigDecimal downPayment;
    private String dob;
    private Instant submittedAt;
    private Instant decidedAt;
    private String signatureData;
    private Instant signedAt;
    private Boolean agreementAccepted;
    private Instant createdAt;
    private Instant updatedAt;

    private Map<String, String> links;
    private Map<String, String> personalInfo;
    private Map<String, String> carDetails;
    private Map<String, String> loanDetails;
    private Map<String, String> employmentInfo;
    private List<Map<String, Object>> documents;
    private List<Map<String, Object>> statusHistories;
}
