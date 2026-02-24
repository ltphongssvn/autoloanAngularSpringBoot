package com.autoloan.backend.repository;

import com.autoloan.backend.model.Document;
import com.autoloan.backend.model.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByApplicationId(Long applicationId);

    List<Document> findByStatus(DocumentStatus status);
}
