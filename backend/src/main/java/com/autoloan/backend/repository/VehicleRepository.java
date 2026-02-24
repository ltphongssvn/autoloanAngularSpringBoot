package com.autoloan.backend.repository;

import com.autoloan.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByApplicationId(Long applicationId);

    Optional<Vehicle> findByVin(String vin);
}
