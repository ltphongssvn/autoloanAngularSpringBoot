package com.autoloan.backend.service;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.autoloan.backend.dto.auth.AuthResponse;
import com.autoloan.backend.dto.auth.LoginRequest;
import com.autoloan.backend.dto.auth.SignupRequest;
import com.autoloan.backend.exception.AccountLockedException;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.UnauthorizedException;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.enums.Role;
import com.autoloan.backend.repository.UserRepository;
import com.autoloan.backend.security.JwtTokenProvider;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User existingUser;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest();
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");
        signupRequest.setPhone("555-1234");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail("test@example.com");
        existingUser.setEncryptedPassword("encodedPassword");
        existingUser.setFirstName("John");
        existingUser.setLastName("Doe");
        existingUser.setRole(Role.CUSTOMER);
        existingUser.setFailedAttempts(0);
        existingUser.setSignInCount(0);
    }

    @Test
    void signupShouldCreateUserAndReturnToken() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtTokenProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.signup(signupRequest);

        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals(1L, response.getUserId());
        assertFalse(response.isOtpRequired());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signupShouldThrowWhenEmailExists() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> authService.signup(signupRequest));
        assertEquals("Email already registered", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginShouldReturnTokenForValidCredentials() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtTokenProvider.generateToken(1L, "test@example.com", "CUSTOMER")).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals(1, existingUser.getSignInCount());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void loginShouldThrowWhenEmailNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                () -> authService.login(loginRequest));
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void loginShouldThrowWhenAccountLocked() {
        existingUser.setLockedAt(Instant.now());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        AccountLockedException ex = assertThrows(AccountLockedException.class,
                () -> authService.login(loginRequest));
        assertEquals("Account is locked", ex.getMessage());
    }

    @Test
    void loginShouldThrowAndIncrementFailedAttemptsWhenPasswordIncorrect() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(false);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                () -> authService.login(loginRequest));
        assertEquals("Invalid email or password", ex.getMessage());
        assertEquals(1, existingUser.getFailedAttempts());
        verify(userRepository).save(existingUser);
    }
}
