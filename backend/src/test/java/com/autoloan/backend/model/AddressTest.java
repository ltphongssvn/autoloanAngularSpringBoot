package com.autoloan.backend.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AddressTest {

    @Test
    void shouldCreateWithBuilder() {
        Address addr = Address.builder()
                .addressType("home")
                .streetAddress("123 Main St")
                .city("Springfield")
                .state("IL")
                .zipCode("62701")
                .applicationId(1L)
                .build();

        assertEquals("home", addr.getAddressType());
        assertEquals("123 Main St", addr.getStreetAddress());
        assertEquals("Springfield", addr.getCity());
        assertEquals("IL", addr.getState());
        assertEquals("62701", addr.getZipCode());
        assertEquals(1L, addr.getApplicationId());
    }

    @Test
    void shouldSetOptionalFields() {
        Address addr = new Address();
        addr.setYearsAtAddress(3);
        addr.setMonthsAtAddress(6);

        assertEquals(3, addr.getYearsAtAddress());
        assertEquals(6, addr.getMonthsAtAddress());
    }
}
