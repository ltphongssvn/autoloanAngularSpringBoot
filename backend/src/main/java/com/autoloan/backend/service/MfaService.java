// backend/src/main/java/com/autoloan/backend/service/MfaService.java
package com.autoloan.backend.service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autoloan.backend.dto.mfa.MfaEnableResponse;
import com.autoloan.backend.dto.mfa.MfaSetupResponse;
import com.autoloan.backend.dto.mfa.MfaStatusResponse;
import com.autoloan.backend.dto.mfa.MfaVerifyResponse;
import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.exception.UnauthorizedException;
import com.autoloan.backend.model.User;
import com.autoloan.backend.repository.UserRepository;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;

@Service
public class MfaService {

    private final UserRepository userRepository;
    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;
    private final SecureRandom secureRandom;

    public MfaService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.secretGenerator = new DefaultSecretGenerator(32);
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1, 6);
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        this.secureRandom = new SecureRandom();
    }

    public MfaStatusResponse getStatus(Long userId) {
        User user = findUser(userId);
        return new MfaStatusResponse(Boolean.TRUE.equals(user.getOtpRequiredForLogin()));
    }

    @Transactional
    public MfaSetupResponse setup(Long userId) {
        User user = findUser(userId);
        if (Boolean.TRUE.equals(user.getOtpRequiredForLogin())) {
            throw new BadRequestException("MFA is already enabled");
        }

        String secret = secretGenerator.generate();
        user.setOtpSecret(secret);
        userRepository.save(user);

        QrData qrData = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("AutoLoan")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        String qrCodeSvg;
        try {
            ZxingPngQrGenerator qrGenerator = new ZxingPngQrGenerator();
            byte[] imageData = qrGenerator.generate(qrData);
            String mimeType = qrGenerator.getImageMimeType();
            qrCodeSvg = Utils.getDataUriForImage(imageData, mimeType);
        } catch (Exception e) {
            qrCodeSvg = "";
        }

        return new MfaSetupResponse(secret, qrData.getUri(), qrCodeSvg);
    }

    @Transactional
    public MfaEnableResponse enable(Long userId, String code) {
        User user = findUser(userId);
        if (user.getOtpSecret() == null) {
            throw new BadRequestException("MFA setup not initiated. Call setup first.");
        }

        if (!codeVerifier.isValidCode(user.getOtpSecret(), code)) {
            throw new UnauthorizedException("Invalid verification code");
        }

        List<String> backupCodes = generateBackupCodes();
        user.setOtpRequiredForLogin(true);
        user.setOtpBackupCodes(String.join(",", backupCodes));
        userRepository.save(user);

        return new MfaEnableResponse(true, backupCodes);
    }

    @Transactional
    public MfaStatusResponse disable(Long userId, String code) {
        User user = findUser(userId);
        if (!Boolean.TRUE.equals(user.getOtpRequiredForLogin())) {
            throw new BadRequestException("MFA is not enabled");
        }

        if (!codeVerifier.isValidCode(user.getOtpSecret(), code) && !verifyBackupCode(user, code)) {
            throw new UnauthorizedException("Invalid verification code");
        }

        user.setOtpRequiredForLogin(false);
        user.setOtpSecret(null);
        user.setOtpBackupCodes(null);
        userRepository.save(user);

        return new MfaStatusResponse(false);
    }

    @Transactional
    public MfaVerifyResponse verify(Long userId, String code) {
        User user = findUser(userId);
        if (!Boolean.TRUE.equals(user.getOtpRequiredForLogin()) || user.getOtpSecret() == null) {
            throw new BadRequestException("MFA is not enabled");
        }

        if (codeVerifier.isValidCode(user.getOtpSecret(), code)) {
            return new MfaVerifyResponse(true, false);
        }

        if (verifyBackupCode(user, code)) {
            List<String> remaining = getBackupCodes(user).stream()
                    .filter(c -> !c.equals(code))
                    .collect(Collectors.toList());
            user.setOtpBackupCodes(String.join(",", remaining));
            userRepository.save(user);
            return new MfaVerifyResponse(true, true);
        }

        throw new UnauthorizedException("Invalid verification code");
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            byte[] bytes = new byte[4];
            secureRandom.nextBytes(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            codes.add(sb.toString());
        }
        return codes;
    }

    private boolean verifyBackupCode(User user, String code) {
        return getBackupCodes(user).contains(code);
    }

    private List<String> getBackupCodes(User user) {
        if (user.getOtpBackupCodes() == null || user.getOtpBackupCodes().isBlank()) {
            return List.of();
        }
        return Arrays.asList(user.getOtpBackupCodes().split(","));
    }
}
