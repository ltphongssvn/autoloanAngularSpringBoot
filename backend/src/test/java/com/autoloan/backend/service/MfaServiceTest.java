// backend/src/test/java/com/autoloan/backend/service/MfaServiceTest.java
package com.autoloan.backend.service;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autoloan.backend.dto.mfa.MfaEnableResponse;
import com.autoloan.backend.dto.mfa.MfaSetupResponse;
import com.autoloan.backend.dto.mfa.MfaStatusResponse;
import com.autoloan.backend.dto.mfa.MfaVerifyResponse;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.exception.UnauthorizedException;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.enums.Role;
import com.autoloan.backend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MfaServiceTest {

    @Mock
    private UserRepository userRepository;

    private MfaService mfaService;

    private User user;

    @BeforeEach
    void setUp() {
        mfaService = new MfaService(userRepository);

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setEncryptedPassword("encoded");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPhone("555-1234");
        user.setRole(Role.CUSTOMER);
        user.setOtpRequiredForLogin(false);
        user.setOtpSecret(null);
        user.setOtpBackupCodes(null);
    }

    // ==================== getStatus ====================

    @Test
    void getStatusShouldReturnFalseWhenMfaNotEnabled() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        MfaStatusResponse response = mfaService.getStatus(1L);

        assertFalse(response.isMfaEnabled());
    }

    @Test
    void getStatusShouldReturnTrueWhenMfaEnabled() {
        user.setOtpRequiredForLogin(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        MfaStatusResponse response = mfaService.getStatus(1L);

        assertTrue(response.isMfaEnabled());
    }

    @Test
    void getStatusShouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> mfaService.getStatus(99L));
    }

    // ==================== setup ====================

    @Test
    void setupShouldReturnSecretAndQrCode() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        MfaSetupResponse response = mfaService.setup(1L);

        assertNotNull(response.getSecret());
        assertFalse(response.getSecret().isEmpty());
        assertNotNull(response.getOtpAuthUrl());
        assertFalse(response.getOtpAuthUrl().isEmpty());
        assertNotNull(response.getQrCodeSvg());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void setupShouldThrowWhenMfaAlreadyEnabled() {
        user.setOtpRequiredForLogin(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> mfaService.setup(1L));
    }

    @Test
    void setupShouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> mfaService.setup(99L));
    }

    // ==================== enable ====================

    @Test
    void enableShouldThrowWhenSecretNotSet() {
        user.setOtpSecret(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> mfaService.enable(1L, "123456"));
    }

    @Test
    void enableShouldThrowWhenInvalidCode() {
        user.setOtpSecret("JBSWY3DPEHPK3PXP");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(UnauthorizedException.class, () -> mfaService.enable(1L, "000000"));
    }

    @Test
    void enableShouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> mfaService.enable(99L, "123456"));
    }

    // ==================== disable ====================

    @Test
    void disableShouldThrowWhenMfaNotEnabled() {
        user.setOtpRequiredForLogin(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> mfaService.disable(1L, "123456"));
    }

    @Test
    void disableShouldThrowWhenInvalidCode() {
        user.setOtpRequiredForLogin(true);
        user.setOtpSecret("JBSWY3DPEHPK3PXP");
        user.setOtpBackupCodes("aabbccdd,11223344");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(UnauthorizedException.class, () -> mfaService.disable(1L, "000000"));
    }

    @Test
    void disableShouldSucceedWithValidBackupCode() {
        user.setOtpRequiredForLogin(true);
        user.setOtpSecret("JBSWY3DPEHPK3PXP");
        user.setOtpBackupCodes("aabbccdd,11223344");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        MfaStatusResponse response = mfaService.disable(1L, "aabbccdd");

        assertFalse(response.isMfaEnabled());
        assertNull(user.getOtpSecret());
        assertNull(user.getOtpBackupCodes());
        verify(userRepository).save(user);
    }

    @Test
    void disableShouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> mfaService.disable(99L, "123456"));
    }

    // ==================== verify ====================

    @Test
    void verifyShouldThrowWhenMfaNotEnabled() {
        user.setOtpRequiredForLogin(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> mfaService.verify(1L, "123456"));
    }

    @Test
    void verifyShouldThrowWhenSecretNull() {
        user.setOtpRequiredForLogin(true);
        user.setOtpSecret(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> mfaService.verify(1L, "123456"));
    }

    @Test
    void verifyShouldThrowWhenInvalidCode() {
        user.setOtpRequiredForLogin(true);
        user.setOtpSecret("JBSWY3DPEHPK3PXP");
        user.setOtpBackupCodes("aabbccdd,11223344");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(UnauthorizedException.class, () -> mfaService.verify(1L, "000000"));
    }

    @Test
    void verifyShouldSucceedWithValidBackupCode() {
        user.setOtpRequiredForLogin(true);
        user.setOtpSecret("JBSWY3DPEHPK3PXP");
        user.setOtpBackupCodes("aabbccdd,11223344");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        MfaVerifyResponse response = mfaService.verify(1L, "aabbccdd");

        assertTrue(response.isValid());
        assertTrue(response.isBackupCodeUsed());
        assertEquals("11223344", user.getOtpBackupCodes());
        verify(userRepository).save(user);
    }

    @Test
    void verifyShouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> mfaService.verify(99L, "123456"));
    }

    @Test
    void verifyShouldHandleEmptyBackupCodes() {
        user.setOtpRequiredForLogin(true);
        user.setOtpSecret("JBSWY3DPEHPK3PXP");
        user.setOtpBackupCodes("");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(UnauthorizedException.class, () -> mfaService.verify(1L, "000000"));
    }

    @Test
    void verifyShouldHandleNullBackupCodes() {
        user.setOtpRequiredForLogin(true);
        user.setOtpSecret("JBSWY3DPEHPK3PXP");
        user.setOtpBackupCodes(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(UnauthorizedException.class, () -> mfaService.verify(1L, "000000"));
    }
}
