package com.autoloan.backend.repository;

import com.autoloan.backend.model.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, Long> {

    List<ApplicationNote> findByApplicationId(Long applicationId);

    List<ApplicationNote> findByApplicationIdAndInternal(Long applicationId, Boolean internal);
}
