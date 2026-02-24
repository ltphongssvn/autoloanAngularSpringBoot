package com.autoloan.backend.repository;

import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserId(Long userId);

    List<Application> findByStatus(ApplicationStatus status);

    List<Application> findByUserIdAndStatus(Long userId, ApplicationStatus status);

    Optional<Application> findByApplicationNumber(String applicationNumber);
}
