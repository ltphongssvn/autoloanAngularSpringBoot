package com.autoloan.backend.controller;

import com.autoloan.backend.dto.application.ApplicationApprovalRequest;
import com.autoloan.backend.dto.application.ApplicationRejectRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.ApplicationWorkflowService;
import com.autoloan.backend.service.LoanService;
import com.autoloan.backend.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-officer/applications")
public class LoanOfficerController {

    private final LoanService loanService;
    private final ApplicationWorkflowService workflowService;
    private final NoteService noteService;
    private final JwtTokenProvider jwtTokenProvider;

    public LoanOfficerController(LoanService loanService,
                                  ApplicationWorkflowService workflowService,
                                  NoteService noteService,
                                  JwtTokenProvider jwtTokenProvider) {
        this.loanService = loanService;
        this.workflowService = workflowService;
        this.noteService = noteService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping
    public ResponseEntity<List<LoanApplicationResponse>> findAll() {
        return ResponseEntity.ok(loanService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanApplicationResponse> findOne(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getApplicationById(id));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<LoanApplicationResponse> startVerification(
            HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.startVerification(id, userId));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<LoanApplicationResponse> moveToReview(
            HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.moveToReview(id, userId));
    }

    @PatchMapping("/{id}/request-documents")
    public ResponseEntity<LoanApplicationResponse> requestDocuments(
            HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.requestDocuments(id, userId));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<LoanApplicationResponse> approve(
            HttpServletRequest request, @PathVariable Long id,
            @RequestBody(required = false) ApplicationApprovalRequest approvalRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.approve(id, userId, approvalRequest));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<LoanApplicationResponse> reject(
            HttpServletRequest request, @PathVariable Long id,
            @RequestBody(required = false) ApplicationRejectRequest rejectRequest) {
        Long userId = getUserIdFromRequest(request);
        String reason = rejectRequest != null ? rejectRequest.getReason() : null;
        return ResponseEntity.ok(workflowService.reject(id, userId, reason));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getHistory(id));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<NoteResponse> addNote(
            HttpServletRequest request, @PathVariable Long id,
            @Valid @RequestBody NoteCreateRequest noteRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(noteService.createNote(id, userId, noteRequest));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
