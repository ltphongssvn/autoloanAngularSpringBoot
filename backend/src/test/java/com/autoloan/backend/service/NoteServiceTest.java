package com.autoloan.backend.service;

import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.ApplicationNote;
import com.autoloan.backend.repository.ApplicationNoteRepository;
import com.autoloan.backend.repository.ApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private ApplicationNoteRepository noteRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private NoteService noteService;

    private Application testApplication;
    private ApplicationNote testNote;

    @BeforeEach
    void setUp() {
        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setUserId(100L);

        testNote = ApplicationNote.builder()
                .id(10L)
                .applicationId(1L)
                .userId(100L)
                .note("Test note")
                .internal(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void createNote_success() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(noteRepository.save(any(ApplicationNote.class))).thenAnswer(inv -> {
            ApplicationNote n = inv.getArgument(0);
            n.setId(10L);
            return n;
        });

        NoteCreateRequest request = new NoteCreateRequest();
        request.setNote("Test note");
        request.setInternal(false);

        NoteResponse response = noteService.createNote(1L, 100L, request);

        assertEquals(10L, response.getId());
        assertEquals("Test note", response.getNote());
        assertFalse(response.getInternal());
        assertEquals(1L, response.getApplicationId());
        assertEquals(100L, response.getUserId());
    }

    @Test
    void createNote_defaultsInternalToFalse() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(noteRepository.save(any(ApplicationNote.class))).thenAnswer(inv -> {
            ApplicationNote n = inv.getArgument(0);
            n.setId(11L);
            return n;
        });

        NoteCreateRequest request = new NoteCreateRequest();
        request.setNote("Note without internal flag");

        NoteResponse response = noteService.createNote(1L, 100L, request);

        assertFalse(response.getInternal());
    }

    @Test
    void createNote_applicationNotFound() {
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        NoteCreateRequest request = new NoteCreateRequest();
        request.setNote("Test");

        assertThrows(ResourceNotFoundException.class,
                () -> noteService.createNote(999L, 100L, request));
    }

    @Test
    void getNotesByApplication_success() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(noteRepository.findByApplicationId(1L)).thenReturn(List.of(testNote));

        List<NoteResponse> responses = noteService.getNotesByApplication(1L);

        assertEquals(1, responses.size());
        assertEquals("Test note", responses.get(0).getNote());
    }

    @Test
    void getNotesByApplication_empty() {
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(noteRepository.findByApplicationId(1L)).thenReturn(List.of());

        List<NoteResponse> responses = noteService.getNotesByApplication(1L);

        assertTrue(responses.isEmpty());
    }

    @Test
    void getNotesByApplication_applicationNotFound() {
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> noteService.getNotesByApplication(999L));
    }
}
