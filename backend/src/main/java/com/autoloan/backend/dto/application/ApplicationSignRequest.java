package com.autoloan.backend.dto.application;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApplicationSignRequest {
    @NotBlank(message = "Signature data is required")
    private String signatureData;
}
