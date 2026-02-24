package com.autoloan.backend.model;

import com.autoloan.backend.model.enums.DocumentStatus;
import com.autoloan.backend.model.enums.DocumentType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DocumentTest {

    @Test
    void shouldCreateWithBuilder() {
        Document doc = Document.builder()
                .docType(DocumentType.DRIVERS_LICENSE)
                .fileName("license.pdf")
                .fileUrl("/uploads/license.pdf")
                .fileSize(204800)
                .contentType("application/pdf")
                .applicationId(1L)
                .build();

        assertEquals(DocumentType.DRIVERS_LICENSE, doc.getDocType());
        assertEquals("license.pdf", doc.getFileName());
        assertEquals("/uploads/license.pdf", doc.getFileUrl());
        assertEquals(204800, doc.getFileSize());
        assertEquals("application/pdf", doc.getContentType());
        assertEquals(1L, doc.getApplicationId());
    }

    @Test
    void shouldDefaultDocTypeToOther() {
        Document doc = Document.builder().fileName("file.txt").applicationId(1L).build();
        assertEquals(DocumentType.OTHER, doc.getDocType());
    }

    @Test
    void shouldDefaultStatusToRequested() {
        Document doc = Document.builder().fileName("file.txt").applicationId(1L).build();
        assertEquals(DocumentStatus.REQUESTED, doc.getStatus());
    }

    @Test
    void shouldSetVerificationFields() {
        Document doc = new Document();
        doc.setStatus(DocumentStatus.VERIFIED);
        doc.setVerifiedById(5L);
        doc.setRejectionNote("Blurry image");

        assertEquals(DocumentStatus.VERIFIED, doc.getStatus());
        assertEquals(5L, doc.getVerifiedById());
        assertEquals("Blurry image", doc.getRejectionNote());
    }
}
