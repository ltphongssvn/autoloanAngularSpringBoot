package com.autoloan.backend.repository;

import com.autoloan.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByConfirmationToken(String confirmationToken);

    Optional<User> findByResetPasswordToken(String resetPasswordToken);

    Optional<User> findByUnlockToken(String unlockToken);

    Optional<User> findByJti(String jti);
}
