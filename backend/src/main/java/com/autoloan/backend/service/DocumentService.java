package com.autoloan.backend.service;

import com.autoloan.backend.dto.document.DocumentResponse;
import com.autoloan.backend.dto.document.DocumentStatusUpdateRequest;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.Document;
import com.autoloan.backend.model.enums.DocumentStatus;
import com.autoloan.backend.model.enums.DocumentType;
import com.autoloan.backend.repository.ApplicationRepository;
import com.autoloan.backend.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ApplicationRepository applicationRepository;

    private static final String UPLOAD_DIR = "uploads/documents";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public DocumentService(DocumentRepository documentRepository,
                           ApplicationRepository applicationRepository) {
        this.documentRepository = documentRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public DocumentResponse uploadDocument(Long applicationId, Long userId,
                                           String docTypeStr, MultipartFile file) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found");
        }

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum of 10MB");
        }

        DocumentType docType;
        try {
            docType = DocumentType.valueOf(docTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid document type: " + docTypeStr);
        }

        String storedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String fileUrl = UPLOAD_DIR + "/" + storedFileName;

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(storedFileName));
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }

        Document document = Document.builder()
                .applicationId(applicationId)
                .docType(docType)
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .fileSize((int) file.getSize())
                .contentType(file.getContentType())
                .status(DocumentStatus.UPLOADED)
                .uploadedAt(Instant.now())
                .build();

        Document saved = documentRepository.save(document);
        return toResponse(saved);
    }

    public List<DocumentResponse> getDocumentsByApplication(Long applicationId, Long userId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Application not found");
        }

        return documentRepository.findByApplicationId(applicationId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DocumentResponse> getDocumentsByApplicationForStaff(Long applicationId) {
        applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        return documentRepository.findByApplicationId(applicationId).stream()
                .map(this::toResponse)
                .toList();
    }

    public DocumentResponse getDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return toResponse(document);
    }

    @Transactional
    public void deleteDocument(Long documentId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        Application app = applicationRepository.findById(document.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Document not found");
        }

        try {
            Path filePath = Paths.get(document.getFileUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail - document record still gets deleted
        }

        documentRepository.delete(document);
    }

    @Transactional
    public DocumentResponse updateDocumentStatus(Long documentId, Long staffUserId,
                                                  DocumentStatusUpdateRequest request) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        DocumentStatus newStatus;
        try {
            newStatus = DocumentStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.getStatus());
        }

        if (newStatus != DocumentStatus.VERIFIED && newStatus != DocumentStatus.REJECTED) {
            throw new BadRequestException("Status can only be updated to VERIFIED or REJECTED");
        }

        if (newStatus == DocumentStatus.REJECTED && (request.getRejectionNote() == null
                || request.getRejectionNote().isBlank())) {
            throw new BadRequestException("Rejection note is required when rejecting a document");
        }

        document.setStatus(newStatus);
        document.setVerifiedById(staffUserId);
        document.setVerifiedAt(Instant.now());

        if (newStatus == DocumentStatus.REJECTED) {
            document.setRejectionNote(request.getRejectionNote());
        }

        Document saved = documentRepository.save(document);
        return toResponse(saved);
    }

    public String getDocumentFileUrl(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return document.getFileUrl();
    }

    private DocumentResponse toResponse(Document doc) {
        DocumentResponse response = new DocumentResponse();
        response.setId(doc.getId());
        response.setDocType(doc.getDocType().name());
        response.setFileName(doc.getFileName());
        response.setFileUrl(doc.getFileUrl());
        response.setFileSize(doc.getFileSize());
        response.setContentType(doc.getContentType());
        response.setStatus(doc.getStatus().name());
        response.setRequestNote(doc.getRequestNote());
        response.setRejectionNote(doc.getRejectionNote());
        response.setUploadedAt(doc.getUploadedAt());
        response.setVerifiedAt(doc.getVerifiedAt());
        response.setVerifiedById(doc.getVerifiedById());
        response.setApplicationId(doc.getApplicationId());
        response.setCreatedAt(doc.getCreatedAt());
        response.setUpdatedAt(doc.getUpdatedAt());
        return response;
    }
}
