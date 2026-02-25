package com.autoloan.backend.service;

import com.autoloan.backend.dto.document.DocumentResponse;
import com.autoloan.backend.dto.document.DocumentStatusUpdateRequest;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.Document;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.model.enums.DocumentStatus;
import com.autoloan.backend.model.enums.DocumentType;
import com.autoloan.backend.repository.ApplicationRepository;
import com.autoloan.backend.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private DocumentService documentService;

    private Application testApplication;
    private Document testDocument;

    @BeforeEach
    void setUp() {
        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setUserId(100L);
        testApplication.setStatus(ApplicationStatus.DRAFT);

        testDocument = Document.builder()
                .id(10L)
                .applicationId(1L)
                .docType(DocumentType.DRIVERS_LICENSE)
                .fileName("license.pdf")
                .fileUrl("uploads/documents/uuid_license.pdf")
                .fileSize(1024)
                .contentType("application/pdf")
                .status(DocumentStatus.UPLOADED)
                .uploadedAt(Instant.now())
                .build();
    }

    @Test
    void uploadDocument_success() throws IOException {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getSize()).thenReturn(1024L);
        when(mockFile.getOriginalFilename()).thenReturn("license.pdf");
        when(mockFile.getContentType()).thenReturn("application/pdf");
        when(mockFile.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[1024]));

        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> {
            Document doc = invocation.getArgument(0);
            doc.setId(10L);
            return doc;
        });

        DocumentResponse response = documentService.uploadDocument(1L, 100L, "DRIVERS_LICENSE", mockFile);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("DRIVERS_LICENSE", response.getDocType());
        assertEquals("license.pdf", response.getFileName());
        assertEquals("UPLOADED", response.getStatus());
        verify(documentRepository).save(any(Document.class));
    }

    @Test
    void uploadDocument_applicationNotFound() {
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());
        MultipartFile mockFile = mock(MultipartFile.class);

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.uploadDocument(999L, 100L, "DRIVERS_LICENSE", mockFile));
    }

    @Test
    void uploadDocument_wrongUser() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        MultipartFile mockFile = mock(MultipartFile.class);

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.uploadDocument(1L, 999L, "DRIVERS_LICENSE", mockFile));
    }

    @Test
    void uploadDocument_emptyFile() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> documentService.uploadDocument(1L, 100L, "DRIVERS_LICENSE", mockFile));
    }

    @Test
    void uploadDocument_fileTooLarge() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getSize()).thenReturn(11 * 1024 * 1024L);

        assertThrows(BadRequestException.class,
                () -> documentService.uploadDocument(1L, 100L, "DRIVERS_LICENSE", mockFile));
    }

    @Test
    void uploadDocument_invalidDocType() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getSize()).thenReturn(1024L);

        assertThrows(BadRequestException.class,
                () -> documentService.uploadDocument(1L, 100L, "INVALID_TYPE", mockFile));
    }

    @Test
    void getDocumentsByApplication_success() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of(testDocument));

        List<DocumentResponse> responses = documentService.getDocumentsByApplication(1L, 100L);

        assertEquals(1, responses.size());
        assertEquals("DRIVERS_LICENSE", responses.get(0).getDocType());
    }

    @Test
    void getDocumentsByApplication_wrongUser() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.getDocumentsByApplication(1L, 999L));
    }

    @Test
    void getDocumentsByApplicationForStaff_success() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(documentRepository.findByApplicationId(1L)).thenReturn(List.of(testDocument));

        List<DocumentResponse> responses = documentService.getDocumentsByApplicationForStaff(1L);

        assertEquals(1, responses.size());
    }

    @Test
    void getDocument_success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));

        DocumentResponse response = documentService.getDocument(10L);

        assertEquals(10L, response.getId());
        assertEquals("DRIVERS_LICENSE", response.getDocType());
    }

    @Test
    void getDocument_notFound() {
        when(documentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.getDocument(999L));
    }

    @Test
    void deleteDocument_success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        assertDoesNotThrow(() -> documentService.deleteDocument(10L, 100L));
        verify(documentRepository).delete(testDocument);
    }

    @Test
    void deleteDocument_wrongUser() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.deleteDocument(10L, 999L));
    }

    @Test
    void deleteDocument_notFound() {
        when(documentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.deleteDocument(999L, 100L));
    }

    @Test
    void updateDocumentStatus_verify_success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        request.setStatus("VERIFIED");

        DocumentResponse response = documentService.updateDocumentStatus(10L, 200L, request);

        assertEquals("VERIFIED", response.getStatus());
        assertEquals(200L, response.getVerifiedById());
        assertNotNull(response.getVerifiedAt());
    }

    @Test
    void updateDocumentStatus_reject_success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        request.setStatus("REJECTED");
        request.setRejectionNote("Document is blurry");

        DocumentResponse response = documentService.updateDocumentStatus(10L, 200L, request);

        assertEquals("REJECTED", response.getStatus());
        assertEquals("Document is blurry", response.getRejectionNote());
    }

    @Test
    void updateDocumentStatus_reject_missingNote() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));

        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        request.setStatus("REJECTED");

        assertThrows(BadRequestException.class,
                () -> documentService.updateDocumentStatus(10L, 200L, request));
    }

    @Test
    void updateDocumentStatus_invalidStatus() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));

        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        request.setStatus("INVALID");

        assertThrows(BadRequestException.class,
                () -> documentService.updateDocumentStatus(10L, 200L, request));
    }

    @Test
    void updateDocumentStatus_onlyVerifiedOrRejected() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));

        DocumentStatusUpdateRequest request = new DocumentStatusUpdateRequest();
        request.setStatus("UPLOADED");

        assertThrows(BadRequestException.class,
                () -> documentService.updateDocumentStatus(10L, 200L, request));
    }

    @Test
    void getDocumentFileUrl_success() {
        when(documentRepository.findById(10L)).thenReturn(Optional.of(testDocument));

        String url = documentService.getDocumentFileUrl(10L);

        assertEquals("uploads/documents/uuid_license.pdf", url);
    }

    @Test
    void getDocumentFileUrl_notFound() {
        when(documentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> documentService.getDocumentFileUrl(999L));
    }
}
