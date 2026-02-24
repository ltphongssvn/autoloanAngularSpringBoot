package com.autoloan.backend.repository;

import com.autoloan.backend.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByApplicationId(Long applicationId);

    List<StatusHistory> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
}
