// backend/src/main/java/com/autoloan/backend/controller/LoanController.java
package com.autoloan.backend.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autoloan.backend.dto.application.ApplicationSignRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.application.StatusUpdateRequest;
import com.autoloan.backend.dto.loan.LoanApplicationRequest;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.dto.loan.PaginatedResponse;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.AgreementPdfService;
import com.autoloan.backend.service.ApplicationWorkflowService;
import com.autoloan.backend.service.LoanService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final ApplicationWorkflowService workflowService;
    private final AgreementPdfService agreementPdfService;
    private final JwtTokenProvider jwtTokenProvider;

    public LoanController(LoanService loanService,
                           ApplicationWorkflowService workflowService,
                           AgreementPdfService agreementPdfService,
                           JwtTokenProvider jwtTokenProvider) {
        this.loanService = loanService;
        this.workflowService = workflowService;
        this.agreementPdfService = agreementPdfService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    public ResponseEntity<LoanApplicationResponse> createApplication(
            HttpServletRequest request,
            @Valid @RequestBody LoanApplicationRequest loanRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.createApplication(userId, loanRequest));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<LoanApplicationResponse>> getUserApplications(
            HttpServletRequest request,
            @RequestParam(name = "$filter", required = false) String filter,
            @RequestParam(name = "$orderby", required = false) String orderby,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "per_page", defaultValue = "20") int perPage) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(loanService.getApplicationsPaginated(userId, filter, orderby, status, page, perPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanApplicationResponse> getApplication(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(loanService.getApplication(id, userId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LoanApplicationResponse> updateApplication(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody LoanApplicationRequest loanRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(loanService.updateApplication(id, userId, loanRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        loanService.deleteApplication(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<LoanApplicationResponse> submitApplication(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(loanService.submitApplication(id, userId));
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<LoanApplicationResponse> signApplication(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody ApplicationSignRequest signRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.sign(id, userId, signRequest.getSignatureData()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LoanApplicationResponse> updateStatus(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest statusRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.updateStatus(id, userId,
                statusRequest.getStatus(), statusRequest.getComment()));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<LoanApplicationResponse> updateStatusPost(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest statusRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.updateStatus(id, userId,
                statusRequest.getStatus(), statusRequest.getComment()));
    }

    @GetMapping("/{id}/agreement_pdf")
    public ResponseEntity<byte[]> agreementPdf(HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        String role = getRoleFromRequest(request);
        AgreementPdfService.PdfResult result = agreementPdfService.generate(id, userId, role);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", result.getFilename());
        return new ResponseEntity<>(result.getBuffer(), headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getHistory(id));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    private String getRoleFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getRoleFromToken(token);
    }
}
