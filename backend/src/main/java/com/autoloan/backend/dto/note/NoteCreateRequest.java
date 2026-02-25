package com.autoloan.backend.dto.note;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NoteCreateRequest {
    @NotBlank(message = "Note content is required")
    private String note;
    private Boolean internal;
}
