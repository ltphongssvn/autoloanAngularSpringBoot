// backend/src/test/java/com/autoloan/backend/service/AuthServiceTest.java
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
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.exception.UnauthorizedException;
import com.autoloan.backend.model.JwtDenylist;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.enums.Role;
import com.autoloan.backend.repository.JwtDenylistRepository;
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

    @Mock
    private JwtDenylistRepository jwtDenylistRepository;

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

    // ==================== signup ====================

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

    // ==================== login ====================

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

    @Test
    void loginShouldLockAccountAfterMaxFailedAttempts() {
        existingUser.setFailedAttempts(4);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest));
        assertEquals(5, existingUser.getFailedAttempts());
        assertNotNull(existingUser.getLockedAt());
        assertNotNull(existingUser.getUnlockToken());
        verify(userRepository).save(existingUser);
    }

    // ==================== logout ====================

    @Test
    void logoutShouldDenylistToken() {
        when(jwtTokenProvider.getJtiFromToken("jwt-token")).thenReturn("jti-123");
        when(jwtDenylistRepository.existsByJti("jti-123")).thenReturn(false);
        when(jwtTokenProvider.getExpirationFromToken("jwt-token")).thenReturn(Instant.now().plusSeconds(3600));
        when(jwtDenylistRepository.save(any(JwtDenylist.class))).thenReturn(new JwtDenylist());

        authService.logout("Bearer jwt-token");

        verify(jwtDenylistRepository).save(any(JwtDenylist.class));
    }

    @Test
    void logoutShouldSkipWhenAlreadyDenylisted() {
        when(jwtTokenProvider.getJtiFromToken("jwt-token")).thenReturn("jti-123");
        when(jwtDenylistRepository.existsByJti("jti-123")).thenReturn(true);

        authService.logout("Bearer jwt-token");

        verify(jwtDenylistRepository, never()).save(any());
    }

    @Test
    void logoutShouldThrowWhenTokenBlank() {
        assertThrows(BadRequestException.class, () -> authService.logout(""));
    }

    @Test
    void logoutShouldThrowWhenTokenNull() {
        assertThrows(BadRequestException.class, () -> authService.logout(null));
    }

    @Test
    void logoutShouldHandleNullJti() {
        when(jwtTokenProvider.getJtiFromToken("jwt-token")).thenReturn(null);

        authService.logout("Bearer jwt-token");

        verify(jwtDenylistRepository, never()).save(any());
    }

    // ==================== forgotPassword ====================

    @Test
    void forgotPasswordShouldSetResetTokenWhenUserExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        String result = authService.forgotPassword("test@example.com");

        assertEquals("If the email exists, a reset link has been sent", result);
        assertNotNull(existingUser.getResetPasswordToken());
        assertNotNull(existingUser.getResetPasswordSentAt());
        verify(userRepository).save(existingUser);
    }

    @Test
    void forgotPasswordShouldReturnSameMessageWhenUserNotFound() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        String result = authService.forgotPassword("nobody@example.com");

        assertEquals("If the email exists, a reset link has been sent", result);
        verify(userRepository, never()).save(any());
    }

    // ==================== resetPassword ====================

    @Test
    void resetPasswordShouldUpdatePassword() {
        existingUser.setResetPasswordToken("reset-token");
        existingUser.setResetPasswordSentAt(Instant.now());
        when(userRepository.findByResetPasswordToken("reset-token")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("newPass123")).thenReturn("encodedNewPass");

        authService.resetPassword("reset-token", "newPass123");

        assertEquals("encodedNewPass", existingUser.getEncryptedPassword());
        assertNull(existingUser.getResetPasswordToken());
        assertNull(existingUser.getResetPasswordSentAt());
        verify(userRepository).save(existingUser);
    }

    @Test
    void resetPasswordShouldThrowWhenTokenInvalid() {
        when(userRepository.findByResetPasswordToken("bad-token")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class,
                () -> authService.resetPassword("bad-token", "newPass123"));
    }

    @Test
    void resetPasswordShouldThrowWhenTokenExpired() {
        existingUser.setResetPasswordToken("expired-token");
        existingUser.setResetPasswordSentAt(Instant.now().minusSeconds(7200));
        when(userRepository.findByResetPasswordToken("expired-token")).thenReturn(Optional.of(existingUser));

        assertThrows(BadRequestException.class,
                () -> authService.resetPassword("expired-token", "newPass123"));
    }

    // ==================== confirmEmail ====================

    @Test
    void confirmEmailShouldConfirmUser() {
        existingUser.setConfirmationToken("confirm-token");
        existingUser.setConfirmedAt(null);
        when(userRepository.findByConfirmationToken("confirm-token")).thenReturn(Optional.of(existingUser));

        String result = authService.confirmEmail("confirm-token");

        assertEquals("Email confirmed successfully", result);
        assertNotNull(existingUser.getConfirmedAt());
        assertNull(existingUser.getConfirmationToken());
        verify(userRepository).save(existingUser);
    }

    @Test
    void confirmEmailShouldThrowWhenTokenInvalid() {
        when(userRepository.findByConfirmationToken("bad-token")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> authService.confirmEmail("bad-token"));
    }

    @Test
    void confirmEmailShouldThrowWhenAlreadyConfirmed() {
        existingUser.setConfirmationToken("confirm-token");
        existingUser.setConfirmedAt(Instant.now());
        when(userRepository.findByConfirmationToken("confirm-token")).thenReturn(Optional.of(existingUser));

        assertThrows(BadRequestException.class, () -> authService.confirmEmail("confirm-token"));
    }

    // ==================== resendConfirmation ====================

    @Test
    void resendConfirmationShouldSetNewTokenWhenUnconfirmed() {
        existingUser.setConfirmedAt(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        String result = authService.resendConfirmation("test@example.com");

        assertEquals("If the email exists and is unconfirmed, a confirmation link has been sent", result);
        assertNotNull(existingUser.getConfirmationToken());
        assertNotNull(existingUser.getConfirmationSentAt());
        verify(userRepository).save(existingUser);
    }

    @Test
    void resendConfirmationShouldNotSaveWhenAlreadyConfirmed() {
        existingUser.setConfirmedAt(Instant.now());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        String result = authService.resendConfirmation("test@example.com");

        assertEquals("If the email exists and is unconfirmed, a confirmation link has been sent", result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void resendConfirmationShouldReturnSameMessageWhenUserNotFound() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        String result = authService.resendConfirmation("nobody@example.com");

        assertEquals("If the email exists and is unconfirmed, a confirmation link has been sent", result);
        verify(userRepository, never()).save(any());
    }

    // ==================== unlockAccount ====================

    @Test
    void unlockAccountShouldUnlockUser() {
        existingUser.setLockedAt(Instant.now());
        existingUser.setUnlockToken("unlock-token");
        existingUser.setFailedAttempts(5);
        when(userRepository.findByUnlockToken("unlock-token")).thenReturn(Optional.of(existingUser));

        String result = authService.unlockAccount("unlock-token");

        assertEquals("Account unlocked successfully", result);
        assertNull(existingUser.getLockedAt());
        assertNull(existingUser.getUnlockToken());
        assertEquals(0, existingUser.getFailedAttempts());
        verify(userRepository).save(existingUser);
    }

    @Test
    void unlockAccountShouldThrowWhenTokenInvalid() {
        when(userRepository.findByUnlockToken("bad-token")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> authService.unlockAccount("bad-token"));
    }

    // ==================== resendUnlock ====================

    @Test
    void resendUnlockShouldSetNewTokenWhenLocked() {
        existingUser.setLockedAt(Instant.now());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        String result = authService.resendUnlock("test@example.com");

        assertEquals("If the email exists and is locked, unlock instructions have been sent", result);
        assertNotNull(existingUser.getUnlockToken());
        verify(userRepository).save(existingUser);
    }

    @Test
    void resendUnlockShouldNotSaveWhenNotLocked() {
        existingUser.setLockedAt(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        String result = authService.resendUnlock("test@example.com");

        assertEquals("If the email exists and is locked, unlock instructions have been sent", result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void resendUnlockShouldReturnSameMessageWhenUserNotFound() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        String result = authService.resendUnlock("nobody@example.com");

        assertEquals("If the email exists and is locked, unlock instructions have been sent", result);
        verify(userRepository, never()).save(any());
    }

    // ==================== getCurrentUser ====================

    @Test
    void getCurrentUserShouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));

        AuthResponse response = authService.getCurrentUser(1L);

        assertEquals("test@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertNull(response.getToken());
    }

    @Test
    void getCurrentUserShouldThrowWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getCurrentUser(99L));
    }

    // ==================== refreshToken ====================

    @Test
    void refreshTokenShouldReturnNewToken() {
        when(jwtTokenProvider.getUserIdFromToken("old-token")).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(jwtTokenProvider.generateToken(1L, "test@example.com", "CUSTOMER")).thenReturn("new-token");

        AuthResponse response = authService.refreshToken("Bearer old-token");

        assertEquals("new-token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void refreshTokenShouldHandleTokenWithoutBearerPrefix() {
        when(jwtTokenProvider.getUserIdFromToken("old-token")).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(jwtTokenProvider.generateToken(1L, "test@example.com", "CUSTOMER")).thenReturn("new-token");

        AuthResponse response = authService.refreshToken("old-token");

        assertEquals("new-token", response.getToken());
    }

    @Test
    void refreshTokenShouldThrowWhenUserNotFound() {
        when(jwtTokenProvider.getUserIdFromToken("old-token")).thenReturn(99L);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> authService.refreshToken("Bearer old-token"));
    }
}
