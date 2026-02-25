package com.autoloan.backend.controller;

import com.autoloan.backend.dto.document.DocumentResponse;
import com.autoloan.backend.dto.document.DocumentStatusUpdateRequest;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.DocumentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentService documentService;
    private final JwtTokenProvider jwtTokenProvider;

    public DocumentController(DocumentService documentService, JwtTokenProvider jwtTokenProvider) {
        this.documentService = documentService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/applications/{applicationId}/documents")
    public ResponseEntity<DocumentResponse> uploadDocument(
            HttpServletRequest request,
            @PathVariable Long applicationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("doc_type") String docType) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocument(applicationId, userId, docType, file));
    }

    @GetMapping("/applications/{applicationId}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByApplication(
            HttpServletRequest request,
            @PathVariable Long applicationId) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(documentService.getDocumentsByApplication(applicationId, userId));
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocument(id));
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserIdFromRequest(request);
        documentService.deleteDocument(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Map<String, String>> downloadDocument(@PathVariable Long id) {
        String fileUrl = documentService.getDocumentFileUrl(id);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }

    @PatchMapping("/documents/{id}/status")
    public ResponseEntity<DocumentResponse> updateDocumentStatus(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody DocumentStatusUpdateRequest statusRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(documentService.updateDocumentStatus(id, userId, statusRequest));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
