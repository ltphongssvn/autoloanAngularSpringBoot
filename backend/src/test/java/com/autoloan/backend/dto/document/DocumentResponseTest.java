package com.autoloan.backend.dto.document;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class DocumentResponseTest {

    @Test
    void testGettersAndSetters() {
        DocumentResponse response = new DocumentResponse();
        response.setId(1L);
        response.setDocType("DRIVERS_LICENSE");
        response.setFileName("license.pdf");
        response.setFileUrl("/uploads/license.pdf");
        response.setFileSize(1024);
        response.setContentType("application/pdf");
        response.setStatus("UPLOADED");
        response.setRequestNote("Please upload");
        response.setRejectionNote(null);
        Instant now = Instant.now();
        response.setUploadedAt(now);
        response.setVerifiedAt(null);
        response.setVerifiedById(null);
        response.setApplicationId(10L);
        response.setCreatedAt(now);
        response.setUpdatedAt(now);

        assertEquals(1L, response.getId());
        assertEquals("DRIVERS_LICENSE", response.getDocType());
        assertEquals("license.pdf", response.getFileName());
        assertEquals("/uploads/license.pdf", response.getFileUrl());
        assertEquals(1024, response.getFileSize());
        assertEquals("application/pdf", response.getContentType());
        assertEquals("UPLOADED", response.getStatus());
        assertEquals("Please upload", response.getRequestNote());
        assertNull(response.getRejectionNote());
        assertEquals(now, response.getUploadedAt());
        assertNull(response.getVerifiedAt());
        assertNull(response.getVerifiedById());
        assertEquals(10L, response.getApplicationId());
        assertEquals(now, response.getCreatedAt());
        assertEquals(now, response.getUpdatedAt());
    }

    @Test
    void testNoArgsConstructor() {
        DocumentResponse response = new DocumentResponse();
        assertNotNull(response);
        assertNull(response.getId());
        assertNull(response.getDocType());
        assertNull(response.getFileName());
    }
}
