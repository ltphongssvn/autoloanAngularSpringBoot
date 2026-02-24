package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class VehicleTest {

    @Test
    void shouldCreateWithBuilder() {
        Vehicle v = Vehicle.builder()
                .make("Toyota")
                .model("Camry")
                .year(2024)
                .vin("1HGBH41JXMN109186")
                .mileage(15000)
                .estimatedValue(new BigDecimal("28000.00"))
                .applicationId(1L)
                .build();

        assertEquals("Toyota", v.getMake());
        assertEquals("Camry", v.getModel());
        assertEquals(2024, v.getYear());
        assertEquals("1HGBH41JXMN109186", v.getVin());
        assertEquals(15000, v.getMileage());
        assertEquals(new BigDecimal("28000.00"), v.getEstimatedValue());
        assertEquals(1L, v.getApplicationId());
    }

    @Test
    void shouldSetOptionalFields() {
        Vehicle v = new Vehicle();
        v.setTrim("SE");
        v.setCondition("excellent");

        assertEquals("SE", v.getTrim());
        assertEquals("excellent", v.getCondition());
    }
}
