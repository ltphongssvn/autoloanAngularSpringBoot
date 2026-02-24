package com.autoloan.backend.repository;

import com.autoloan.backend.model.JwtDenylist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface JwtDenylistRepository extends JpaRepository<JwtDenylist, Long> {

    Optional<JwtDenylist> findByJti(String jti);

    boolean existsByJti(String jti);

    void deleteByExpBefore(Instant expiry);
}
