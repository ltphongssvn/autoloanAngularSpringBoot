package com.autoloan.backend.dto.user;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private Instant confirmedAt;
    private Instant currentSignInAt;
    private Instant lastSignInAt;
    private int signInCount;
    private Instant createdAt;
}
