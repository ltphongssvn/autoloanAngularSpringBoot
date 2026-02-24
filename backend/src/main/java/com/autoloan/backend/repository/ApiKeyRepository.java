package com.autoloan.backend.repository;

import com.autoloan.backend.model.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {

    List<ApiKey> findByUserId(Long userId);

    Optional<ApiKey> findByKeyDigest(String keyDigest);

    List<ApiKey> findByUserIdAndActiveTrue(Long userId);
}
