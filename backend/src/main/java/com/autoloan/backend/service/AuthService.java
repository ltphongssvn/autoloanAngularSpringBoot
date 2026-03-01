package com.autoloan.backend.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtDenylistRepository jwtDenylistRepository;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       JwtDenylistRepository jwtDenylistRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtDenylistRepository = jwtDenylistRepository;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setEncryptedPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(Role.CUSTOMER);
        user.setConfirmationToken(UUID.randomUUID().toString());
        user.setConfirmationSentAt(Instant.now());

        User saved = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name());
        return buildAuthResponse(saved, token, false);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getLockedAt() != null) {
            throw new AccountLockedException("Account is locked");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getEncryptedPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLockedAt(Instant.now());
                user.setUnlockToken(UUID.randomUUID().toString());
            }
            userRepository.save(user);
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setFailedAttempts(0);
        user.setLastSignInAt(user.getCurrentSignInAt());
        user.setCurrentSignInAt(Instant.now());
        user.setSignInCount(user.getSignInCount() + 1);
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, token, false);
    }

    @Transactional
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Token is required");
        }

        String jti = jwtTokenProvider.getJtiFromToken(token);
        if (jti != null && !jwtDenylistRepository.existsByJti(jti)) {
            JwtDenylist denylistEntry = new JwtDenylist();
            denylistEntry.setJti(jti);
            denylistEntry.setExp(jwtTokenProvider.getExpirationFromToken(token));
            jwtDenylistRepository.save(denylistEntry);
        }
    }

    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user != null) {
            user.setResetPasswordToken(UUID.randomUUID().toString());
            user.setResetPasswordSentAt(Instant.now());
            userRepository.save(user);
        }

        // Always return success to prevent email enumeration
        return "If the email exists, a reset link has been sent";
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetPasswordSentAt() != null
                && user.getResetPasswordSentAt().plusSeconds(3600).isBefore(Instant.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setEncryptedPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordSentAt(null);
        userRepository.save(user);
    }

    @Transactional
    public String confirmEmail(String confirmationToken) {
        User user = userRepository.findByConfirmationToken(confirmationToken)
                .orElseThrow(() -> new BadRequestException("Invalid confirmation token"));

        if (user.getConfirmedAt() != null) {
            throw new BadRequestException("Email already confirmed");
        }

        user.setConfirmedAt(Instant.now());
        user.setConfirmationToken(null);
        userRepository.save(user);

        return "Email confirmed successfully";
    }

    @Transactional
    public String resendConfirmation(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user != null && user.getConfirmedAt() == null) {
            user.setConfirmationToken(UUID.randomUUID().toString());
            user.setConfirmationSentAt(Instant.now());
            userRepository.save(user);
        }

        return "If the email exists and is unconfirmed, a confirmation link has been sent";
    }

    @Transactional
    public String unlockAccount(String unlockToken) {
        User user = userRepository.findByUnlockToken(unlockToken)
                .orElseThrow(() -> new BadRequestException("Invalid unlock token"));

        user.setLockedAt(null);
        user.setUnlockToken(null);
        user.setFailedAttempts(0);
        userRepository.save(user);

        return "Account unlocked successfully";
    }

    @Transactional
    public String resendUnlock(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user != null && user.getLockedAt() != null) {
            user.setUnlockToken(UUID.randomUUID().toString());
            userRepository.save(user);
        }

        return "If the email exists and is locked, unlock instructions have been sent";
    }

    public AuthResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildAuthResponse(user, null, false);
    }

    public AuthResponse refreshToken(String oldToken) {
        if (oldToken != null && oldToken.startsWith("Bearer ")) {
            oldToken = oldToken.substring(7);
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(oldToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String newToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, newToken, false);
    }

    private AuthResponse buildAuthResponse(User user, String token, boolean otpRequired) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole().name());
        response.setUserId(user.getId());
        response.setOtpRequired(otpRequired);
        return response;
    }
}
