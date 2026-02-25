package com.autoloan.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autoloan.backend.dto.loan.LoanApplicationRequest;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.LoanService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;
    private final JwtTokenProvider jwtTokenProvider;

    public LoanController(LoanService loanService, JwtTokenProvider jwtTokenProvider) {
        this.loanService = loanService;
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
    public ResponseEntity<List<LoanApplicationResponse>> getUserApplications(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(loanService.getUserApplications(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanApplicationResponse> getApplication(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(loanService.getApplication(id, userId));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<LoanApplicationResponse> submitApplication(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(loanService.submitApplication(id, userId));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
