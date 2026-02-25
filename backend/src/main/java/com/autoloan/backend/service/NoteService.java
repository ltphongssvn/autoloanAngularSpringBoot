package com.autoloan.backend.service;

import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.ApplicationNote;
import com.autoloan.backend.repository.ApplicationNoteRepository;
import com.autoloan.backend.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteService {

    private final ApplicationNoteRepository noteRepository;
    private final ApplicationRepository applicationRepository;

    public NoteService(ApplicationNoteRepository noteRepository,
                       ApplicationRepository applicationRepository) {
        this.noteRepository = noteRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public NoteResponse createNote(Long applicationId, Long userId, NoteCreateRequest request) {
        applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        ApplicationNote note = ApplicationNote.builder()
                .applicationId(applicationId)
                .userId(userId)
                .note(request.getNote())
                .internal(request.getInternal() != null ? request.getInternal() : false)
                .build();

        ApplicationNote saved = noteRepository.save(note);
        return toResponse(saved);
    }

    public List<NoteResponse> getNotesByApplication(Long applicationId) {
        applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        return noteRepository.findByApplicationId(applicationId).stream()
                .map(this::toResponse)
                .toList();
    }

    private NoteResponse toResponse(ApplicationNote note) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setNote(note.getNote());
        response.setInternal(note.getInternal());
        response.setApplicationId(note.getApplicationId());
        response.setUserId(note.getUserId());
        response.setCreatedAt(note.getCreatedAt());
        response.setUpdatedAt(note.getUpdatedAt());
        return response;
    }
}
