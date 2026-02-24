package com.autoloan.backend.repository;

import com.autoloan.backend.model.FinancialInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialInfoRepository extends JpaRepository<FinancialInfo, Long> {

    List<FinancialInfo> findByApplicationId(Long applicationId);
}
