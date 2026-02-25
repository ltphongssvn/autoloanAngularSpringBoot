package com.autoloan.backend.controller;

import com.autoloan.backend.dto.note.NoteCreateRequest;
import com.autoloan.backend.dto.note.NoteResponse;
import com.autoloan.backend.security.JwtTokenProvider;
import com.autoloan.backend.service.NoteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/notes")
public class NoteController {

    private final NoteService noteService;
    private final JwtTokenProvider jwtTokenProvider;

    public NoteController(NoteService noteService, JwtTokenProvider jwtTokenProvider) {
        this.noteService = noteService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            HttpServletRequest request,
            @PathVariable Long applicationId,
            @Valid @RequestBody NoteCreateRequest noteRequest) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noteService.createNote(applicationId, userId, noteRequest));
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getNotesByApplication(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(noteService.getNotesByApplication(applicationId));
    }

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }
}
