// backend/src/test/java/com/autoloan/backend/service/ApplicationSpecificationTest.java
package com.autoloan.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.autoloan.backend.model.Application;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationSpecificationTest {

    @Mock
    private Root<Application> root;
    @Mock
    private CriteriaQuery<?> query;
    @Mock
    private CriteriaBuilder cb;
    @Mock
    private Path<Object> path;
    @Mock
    private Expression<String> stringExpr;
    @Mock
    private Predicate predicate;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        lenient().when(root.get(anyString())).thenReturn(path);
        lenient().when(path.as(any(Class.class))).thenReturn(stringExpr);
        lenient().when(cb.conjunction()).thenReturn(predicate);
        lenient().when(cb.and(any(Predicate[].class))).thenReturn(predicate);
        lenient().when(cb.equal(any(), any())).thenReturn(predicate);
        lenient().when(cb.notEqual(any(), any())).thenReturn(predicate);
        lenient().when(cb.like(any(Expression.class), anyString())).thenReturn(predicate);
        lenient().when(cb.lower(any(Expression.class))).thenReturn(stringExpr);
        lenient().when(cb.isNull(any())).thenReturn(predicate);
        lenient().when(cb.isNotNull(any())).thenReturn(predicate);
        lenient().when(cb.greaterThan(any(Expression.class), any(Comparable.class))).thenReturn(predicate);
        lenient().when(cb.greaterThanOrEqualTo(any(Expression.class), any(Comparable.class))).thenReturn(predicate);
        lenient().when(cb.lessThan(any(Expression.class), any(Comparable.class))).thenReturn(predicate);
        lenient().when(cb.lessThanOrEqualTo(any(Expression.class), any(Comparable.class))).thenReturn(predicate);
    }

    // ==================== noOp ====================

    @Test
    void noOpShouldReturnConjunction() {
        Specification<Application> spec = ApplicationSpecification.noOp();
        Predicate result = spec.toPredicate(root, query, cb);
        assertNotNull(result);
        verify(cb).conjunction();
    }

    // ==================== fromOdataFilter ====================

    @Test
    void fromOdataFilterNullReturnsConjunction() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter(null);
        spec.toPredicate(root, query, cb);
        verify(cb).conjunction();
    }

    @Test
    void fromOdataFilterBlankReturnsConjunction() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("");
        spec.toPredicate(root, query, cb);
        verify(cb).conjunction();
    }

    @Test
    void fromOdataFilterContainsSingleQuotes() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(status,'DRAFT')");
        spec.toPredicate(root, query, cb);
        verify(cb).like(any(Expression.class), eq("%draft%"));
    }

    @Test
    void fromOdataFilterContainsDoubleQuotes() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(status,\"DRAFT\")");
        spec.toPredicate(root, query, cb);
        verify(cb).like(any(Expression.class), eq("%draft%"));
    }

    @Test
    void fromOdataFilterEqString() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq 'DRAFT'");
        spec.toPredicate(root, query, cb);
        verify(cb).equal(any(), eq("DRAFT"));
    }

    @Test
    void fromOdataFilterNeString() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status ne 'REJECTED'");
        spec.toPredicate(root, query, cb);
        verify(cb).notEqual(any(), eq("REJECTED"));
    }

    @Test
    void fromOdataFilterGtInteger() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term gt 12");
        spec.toPredicate(root, query, cb);
        verify(cb).greaterThan(any(Expression.class), any(Comparable.class));
    }

    @Test
    void fromOdataFilterGeInteger() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term ge 12");
        spec.toPredicate(root, query, cb);
        verify(cb).greaterThanOrEqualTo(any(Expression.class), any(Comparable.class));
    }

    @Test
    void fromOdataFilterLtInteger() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term lt 60");
        spec.toPredicate(root, query, cb);
        verify(cb).lessThan(any(Expression.class), any(Comparable.class));
    }

    @Test
    void fromOdataFilterLeInteger() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("loan_term le 60");
        spec.toPredicate(root, query, cb);
        verify(cb).lessThanOrEqualTo(any(Expression.class), any(Comparable.class));
    }

    @Test
    void fromOdataFilterEqNull() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq null");
        spec.toPredicate(root, query, cb);
        verify(cb).isNull(any());
    }

    @Test
    void fromOdataFilterNeNull() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status ne null");
        spec.toPredicate(root, query, cb);
        verify(cb).isNotNull(any());
    }

    @Test
    void fromOdataFilterEqTrue() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq true");
        spec.toPredicate(root, query, cb);
        verify(cb).equal(any(), eq(true));
    }

    @Test
    void fromOdataFilterEqFalse() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq false");
        spec.toPredicate(root, query, cb);
        verify(cb).equal(any(), eq(false));
    }

    @Test
    void fromOdataFilterDecimal() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("interest_rate gt 5.5");
        spec.toPredicate(root, query, cb);
        verify(cb).greaterThan(any(Expression.class), any(Comparable.class));
    }

    @Test
    void fromOdataFilterAndCombination() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq 'DRAFT' and loan_term gt 12");
        spec.toPredicate(root, query, cb);
        verify(cb).equal(any(), eq("DRAFT"));
        verify(cb).greaterThan(any(Expression.class), any(Comparable.class));
    }

    @Test
    void fromOdataFilterIgnoresDisallowedFields() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("hacker_field eq 'bad'");
        spec.toPredicate(root, query, cb);
        verify(cb, never()).equal(any(), eq("bad"));
    }

    @Test
    void fromOdataFilterIgnoresDisallowedContainsFields() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(hacker_field,'bad')");
        spec.toPredicate(root, query, cb);
        verify(cb, never()).like(any(Expression.class), anyString());
    }

    @Test
    void fromOdataFilterMalformedContains() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("contains(status)");
        spec.toPredicate(root, query, cb);
        verify(cb, never()).like(any(Expression.class), anyString());
    }

    @Test
    void fromOdataFilterInstantValue() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("created_at gt 2025-01-01T00:00:00Z");
        spec.toPredicate(root, query, cb);
        verify(cb).greaterThan(any(Expression.class), any(Comparable.class));
    }

    @Test
    void fromOdataFilterUnparseableDateFallsBackToString() {
        Specification<Application> spec = ApplicationSpecification.fromOdataFilter("status eq not-a-date-or-number");
        spec.toPredicate(root, query, cb);
        verify(cb).equal(any(), eq("not-a-date-or-number"));
    }

    // ==================== withUserId ====================

    @Test
    void withUserIdShouldCreateEqualPredicate() {
        Specification<Application> spec = ApplicationSpecification.withUserId(1L);
        spec.toPredicate(root, query, cb);
        verify(cb).equal(any(), eq(1L));
    }

    // ==================== withStatus ====================

    @Test
    void withStatusValidReturnsEqualPredicate() {
        Specification<Application> spec = ApplicationSpecification.withStatus("DRAFT");
        spec.toPredicate(root, query, cb);
        verify(cb).equal(any(), eq("DRAFT"));
    }

    @Test
    void withStatusNullReturnsConjunction() {
        Specification<Application> spec = ApplicationSpecification.withStatus(null);
        spec.toPredicate(root, query, cb);
        verify(cb).conjunction();
    }

    @Test
    void withStatusBlankReturnsConjunction() {
        Specification<Application> spec = ApplicationSpecification.withStatus("");
        spec.toPredicate(root, query, cb);
        verify(cb).conjunction();
    }

    // ==================== parseOdataOrderby ====================

    @Test
    void parseOdataOrderbyNullReturnsDefault() {
        Sort sort = ApplicationSpecification.parseOdataOrderby(null);
        assertTrue(sort.isSorted());
    }

    @Test
    void parseOdataOrderbyBlankReturnsDefault() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("");
        assertTrue(sort.isSorted());
    }

    @Test
    void parseOdataOrderbyAsc() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("created_at asc");
        Sort.Order order = sort.getOrderFor("createdAt");
        assertNotNull(order);
        assertTrue(order.isAscending());
    }

    @Test
    void parseOdataOrderbyDesc() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("created_at desc");
        Sort.Order order = sort.getOrderFor("createdAt");
        assertNotNull(order);
        assertFalse(order.isAscending());
    }

    @Test
    void parseOdataOrderbyDefaultsToDesc() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("created_at");
        Sort.Order order = sort.getOrderFor("createdAt");
        assertNotNull(order);
        assertFalse(order.isAscending());
    }

    @Test
    void parseOdataOrderbyMultipleFields() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("status asc,created_at desc");
        assertNotNull(sort.getOrderFor("status"));
        assertNotNull(sort.getOrderFor("createdAt"));
    }

    @Test
    void parseOdataOrderbyIgnoresDisallowedFields() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("hacker_field asc");
        assertTrue(sort.isSorted());
    }

    @Test
    void parseOdataOrderbyLoanAmount() {
        Sort sort = ApplicationSpecification.parseOdataOrderby("loan_amount asc");
        Sort.Order order = sort.getOrderFor("loanAmount");
        assertNotNull(order);
        assertTrue(order.isAscending());
    }
}
