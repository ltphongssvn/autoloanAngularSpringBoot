// backend/src/main/java/com/autoloan/backend/service/ApplicationSpecification.java
package com.autoloan.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.domain.Specification;

import com.autoloan.backend.model.Application;

import jakarta.persistence.criteria.Predicate;

public class ApplicationSpecification {

    private static final Map<String, String> FIELD_MAP = Map.of(
            "status", "status",
            "current_step", "currentStep",
            "loan_term", "loanTerm",
            "interest_rate", "interestRate",
            "created_at", "createdAt",
            "updated_at", "updatedAt",
            "submitted_at", "submittedAt",
            "loan_amount", "loanAmount"
    );

    private static final List<String> ALLOWED_FILTER_FIELDS = List.of(
            "status", "current_step", "loan_term", "interest_rate",
            "created_at", "updated_at", "submitted_at"
    );

    private ApplicationSpecification() {
    }

    public static Specification<Application> fromOdataFilter(String filterStr) {
        if (filterStr == null || filterStr.isBlank()) {
            return Specification.where((Specification<Application>) null);
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            String[] parts = filterStr.split("(?i)\\s+and\\s+");

            for (String part : parts) {
                String trimmed = part.trim();
                Predicate predicate = parseContains(trimmed, root, cb);
                if (predicate == null) {
                    predicate = parseComparison(trimmed, root, cb);
                }
                if (predicate != null) {
                    predicates.add(predicate);
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Application> withUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    public static Specification<Application> withStatus(String status) {
        if (status == null || status.isBlank()) {
            return Specification.where((Specification<Application>) null);
        }
        return (root, query, cb) -> cb.equal(root.get("status").as(String.class), status.toUpperCase());
    }

    @SuppressWarnings("unchecked")
    private static Predicate parseContains(String expr, jakarta.persistence.criteria.Root<Application> root,
                                            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (!expr.toLowerCase().startsWith("contains(")) {
            return null;
        }
        String inner = expr.substring(9);
        if (inner.endsWith(")")) {
            inner = inner.substring(0, inner.length() - 1);
        }
        String[] tokens = inner.split(",", 2);
        if (tokens.length != 2) return null;

        String field = tokens[0].trim();
        String value = tokens[1].trim();

        if (!ALLOWED_FILTER_FIELDS.contains(field)) return null;
        String jpaField = FIELD_MAP.getOrDefault(field, field);

        if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith("\"") && value.endsWith("\""))) {
            value = value.substring(1, value.length() - 1);
        }

        return cb.like(cb.lower(root.get(jpaField).as(String.class)), "%" + value.toLowerCase() + "%");
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private static Predicate parseComparison(String expr, jakarta.persistence.criteria.Root<Application> root,
                                              jakarta.persistence.criteria.CriteriaBuilder cb) {
        String[] operators = {"eq", "ne", "gt", "ge", "lt", "le"};
        for (String op : operators) {
            String pattern = "(?i)^(\\w+)\\s+" + op + "\\s+(.+)$";
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(pattern).matcher(expr);
            if (matcher.matches()) {
                String field = matcher.group(1);
                String rawValue = matcher.group(2).trim();

                if (!ALLOWED_FILTER_FIELDS.contains(field)) return null;
                String jpaField = FIELD_MAP.getOrDefault(field, field);
                Object value = parseValue(rawValue);

                switch (op.toLowerCase()) {
                    case "eq":
                        if (value == null) return cb.isNull(root.get(jpaField));
                        return cb.equal(root.get(jpaField).as(value.getClass()), value);
                    case "ne":
                        if (value == null) return cb.isNotNull(root.get(jpaField));
                        return cb.notEqual(root.get(jpaField).as(value.getClass()), value);
                    case "gt":
                        if (value instanceof Comparable) return cb.greaterThan(root.get(jpaField), (Comparable) value);
                        break;
                    case "ge":
                        if (value instanceof Comparable) return cb.greaterThanOrEqualTo(root.get(jpaField), (Comparable) value);
                        break;
                    case "lt":
                        if (value instanceof Comparable) return cb.lessThan(root.get(jpaField), (Comparable) value);
                        break;
                    case "le":
                        if (value instanceof Comparable) return cb.lessThanOrEqualTo(root.get(jpaField), (Comparable) value);
                        break;
                    default:
                        break;
                }
            }
        }
        return null;
    }

    private static Object parseValue(String val) {
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith("\"") && val.endsWith("\""))) {
            return val.substring(1, val.length() - 1);
        }
        if ("true".equalsIgnoreCase(val)) return true;
        if ("false".equalsIgnoreCase(val)) return false;
        if ("null".equalsIgnoreCase(val)) return null;
        try {
            if (val.contains(".")) return Double.parseDouble(val);
            return Integer.parseInt(val);
        } catch (NumberFormatException e) {
            if (val.contains("T") || val.contains("-")) {
                try { return Instant.parse(val); } catch (Exception ignored) { }
            }
            return val;
        }
    }

    public static org.springframework.data.domain.Sort parseOdataOrderby(String orderbyStr) {
        if (orderbyStr == null || orderbyStr.isBlank()) {
            return org.springframework.data.domain.Sort.by(
                    org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        }

        List<String> allowedOrderFields = List.of(
                "status", "current_step", "created_at", "updated_at", "submitted_at", "loan_amount");

        List<org.springframework.data.domain.Sort.Order> orders = new ArrayList<>();
        String[] parts = orderbyStr.split(",");

        for (String part : parts) {
            String[] tokens = part.trim().split("\\s+");
            String field = tokens[0];
            if (!allowedOrderFields.contains(field)) continue;
            String jpaField = FIELD_MAP.getOrDefault(field, field);
            org.springframework.data.domain.Sort.Direction dir =
                    (tokens.length > 1 && "asc".equalsIgnoreCase(tokens[1]))
                            ? org.springframework.data.domain.Sort.Direction.ASC
                            : org.springframework.data.domain.Sort.Direction.DESC;
            orders.add(new org.springframework.data.domain.Sort.Order(dir, jpaField));
        }

        return orders.isEmpty()
                ? org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
                : org.springframework.data.domain.Sort.by(orders);
    }
}
