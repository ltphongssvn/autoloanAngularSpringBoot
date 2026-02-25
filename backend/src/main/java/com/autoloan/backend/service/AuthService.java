package com.autoloan.backend.service;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
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
