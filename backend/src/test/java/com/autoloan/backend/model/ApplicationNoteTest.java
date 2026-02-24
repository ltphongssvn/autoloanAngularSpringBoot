package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationNoteTest {

    @Test
    void shouldCreateWithBuilder() {
        ApplicationNote note = ApplicationNote.builder()
                .note("Needs additional documents")
                .internal(true)
                .applicationId(1L)
                .userId(2L)
                .build();

        assertEquals("Needs additional documents", note.getNote());
        assertTrue(note.getInternal());
        assertEquals(1L, note.getApplicationId());
        assertEquals(2L, note.getUserId());
    }

    @Test
    void shouldSetAndGetFields() {
        ApplicationNote note = new ApplicationNote();
        note.setNote("Customer called");
        note.setInternal(false);

        assertEquals("Customer called", note.getNote());
        assertFalse(note.getInternal());
    }
}
