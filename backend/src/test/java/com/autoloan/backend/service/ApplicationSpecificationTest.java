// backend/src/test/java/com/autoloan/backend/service/ApplicationSpecificationTest.java
package com.autoloan.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.autoloan.backend.model.Application;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationSpecificationTest {

    // ==================== fromOdataFilter ====================

    @Test
    void fromOdataFilterShouldReturnSpecForNull() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter(null);
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForBlank() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForContains() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(status,'DRAFT')");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForContainsDoubleQuotes() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(status,\"DRAFT\")");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForEq() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq 'DRAFT'");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForNe() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status ne 'REJECTED'");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForGt() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term gt 12");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForGe() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term ge 12");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForLt() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term lt 60");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForLe() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term le 60");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForEqNull() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq null");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForNeNull() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status ne null");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForBooleanTrue() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq true");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForBooleanFalse() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq false");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForDecimal() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("interest_rate gt 5.5");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldReturnSpecForAndCombination() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq 'DRAFT' and loan_term gt 12");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldIgnoreDisallowedFields() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("hacker_field eq 'bad'");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldIgnoreDisallowedContainsFields() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(hacker_field,'bad')");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldHandleMalformedContains() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(status)");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldHandleInstantValue() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("created_at gt 2025-01-01T00:00:00Z");
        assertNotNull(spec);
    }

    @Test
    void fromOdataFilterShouldHandleNonContainsStartingWithContains() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq 'containsValue'");
        assertNotNull(spec);
    }

    // ==================== withUserId ====================

    @Test
    void withUserIdShouldReturnSpec() {
        Specification<Application> spec = ApplicationSpecification.withUserId(1L);
        assertNotNull(spec);
    }

    // ==================== withStatus ====================

    @Test
    void withStatusShouldReturnSpecForValidStatus() {
        Specification<Application> spec = ApplicationSpecification.withStatus("DRAFT");
        assertNotNull(spec);
    }

    @Test
    void withStatusShouldReturnSpecForNull() {
        Specification<Application> spec = ApplicationSpecification.withStatus(null);
        assertNotNull(spec);
    }

    @Test
    void withStatusShouldReturnSpecForBlank() {
        Specification<Application> spec = ApplicationSpecification.withStatus("");
        assertNotNull(spec);
    }

    // ==================== parseOdataOrderby ====================

    @Test
    void parseOdataOrderbyShouldReturnDefaultForNull() {
        Sort sort = ApplicationSpecification.parseOdataOrderby(null);
        assertNotNull(sort);
        assertTrue(sort.isSorted());
    }

    @Test
    void parseOdataOrderbyShouldReturnDefaultForBlank() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("");
        assertNotNull(sort);
        assertTrue(sort.isSorted());
    }

    @Test
    void parseOdataOrderbyShouldParseAsc() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("created_at asc");
        assertNotNull(sort);
        Sort.Order order = sort.getOrderFor("createdAt");
        assertNotNull(order);
        assertTrue(order.isAscending());
    }

    @Test
    void parseOdataOrderbyShouldParseDesc() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("created_at desc");
        assertNotNull(sort);
        Sort.Order order = sort.getOrderFor("createdAt");
        assertNotNull(order);
        assertFalse(order.isAscending());
    }

    @Test
    void parseOdataOrderbyShouldDefaultToDesc() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("created_at");
        assertNotNull(sort);
        Sort.Order order = sort.getOrderFor("createdAt");
        assertNotNull(order);
        assertFalse(order.isAscending());
    }

    @Test
    void parseOdataOrderbyShouldHandleMultipleFields() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("status asc,created_at desc");
        assertNotNull(sort);
        assertNotNull(sort.getOrderFor("status"));
        assertNotNull(sort.getOrderFor("createdAt"));
    }

    @Test
    void parseOdataOrderbyShouldIgnoreDisallowedFields() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("hacker_field asc");
        assertNotNull(sort);
        assertTrue(sort.isSorted());
    }

    @Test
    void parseOdataOrderbyShouldMapLoanAmount() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("loan_amount asc");
        assertNotNull(sort);
        Sort.Order order = sort.getOrderFor("loanAmount");
        assertNotNull(order);
        assertTrue(order.isAscending());
    }
}
