package com.autoloan.backend.dto.application;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApplicationRejectRequest {
    private String reason;
}
