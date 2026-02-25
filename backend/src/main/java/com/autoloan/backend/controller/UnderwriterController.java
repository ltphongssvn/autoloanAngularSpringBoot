package com.autoloan.backend.controller;

import com.autoloan.backend.dto.application.ApplicationApprovalRequest;
import com.autoloan.backend.dto.application.ApplicationRejectRequest;
import com.autoloan.backend.dto.application.StatusHistoryResponse;
import com.autoloan.backend.dto.document.DocumentResponse;
import com.autoloan.backend.dto.loan.LoanApplicationResponse;
import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.ApplicationWorkflowService;
import com.autoloan.backend.service.DocumentService;
import com.autoloan.backend.service.LoanService;
import com.autoloan.backend.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/underwriter/applications")
public class UnderwriterController {

    private final LoanService loanService;
    private final ApplicationWorkflowService workflowService;
    private final NoteService noteService;
    private final DocumentService documentService;
    private final JwtTokenProvider jwtTokenProvider;

    public UnderwriterController(LoanService loanService,
                                  ApplicationWorkflowService workflowService,
                                  NoteService noteService,
                                  DocumentService documentService,
                                  JwtTokenProvider jwtTokenProvider) {
        this.loanService = loanService;
        this.workflowService = workflowService;
        this.noteService = noteService;
        this.documentService = documentService;
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

    @PostMapping("/{id}/approve")
    public ResponseEntity<LoanApplicationResponse> approve(
            HttpServletRequest request, @PathVariable Long id,
            @RequestBody(required = false) ApplicationApprovalRequest approvalRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.approve(id, userId, approvalRequest));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<LoanApplicationResponse> reject(
            HttpServletRequest request, @PathVariable Long id,
            @RequestBody(required = false) ApplicationRejectRequest rejectRequest) {
        Long userId = getUserIdFromRequest(request);
        String reason = rejectRequest != null ? rejectRequest.getReason() : null;
        return ResponseEntity.ok(workflowService.reject(id, userId, reason));
    }

    @PostMapping("/{id}/request-documents")
    public ResponseEntity<LoanApplicationResponse> requestDocuments(
            HttpServletRequest request, @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(workflowService.requestDocuments(id, userId));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<NoteResponse> addNote(
            HttpServletRequest request, @PathVariable Long id,
            @Valid @RequestBody NoteCreateRequest noteRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(noteService.createNote(id, userId, noteRequest));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<NoteResponse>> getNotes(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNotesByApplication(id));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentsByApplicationForStaff(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getHistory(id));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
