package com.autoloan.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Component
@Order(4)
public class RequestValidatorFilter extends OncePerRequestFilter {

    static final int MAX_BODY_SIZE = 1024 * 1024; // 1MB

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/json",
            "application/x-www-form-urlencoded",
            "multipart/form-data"
    );

    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "PATCH");

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        int contentLength = request.getContentLength();
        if (contentLength > MAX_BODY_SIZE) {
            writeErrorResponse(response, 413, "PayloadTooLarge",
                    "Request body exceeds maximum size of 1MB",
                    "BodySizeExceeded", request);
            return;
        }

        if (MUTATING_METHODS.contains(request.getMethod()) && request.getContentType() != null) {
            String contentType = request.getContentType().split(";")[0].trim().toLowerCase();
            if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
                writeErrorResponse(response, 415, "UnsupportedMediaType",
                        "Content-Type '" + contentType + "' is not supported. Allowed: "
                                + String.join(", ", ALLOWED_CONTENT_TYPES),
                        "InvalidContentType", request);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void writeErrorResponse(HttpServletResponse response, int status,
                                     String code, String message, String innerCode,
                                     HttpServletRequest request) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");

        String requestId = request.getHeader("x-request-id");
        if (requestId == null) {
            requestId = "unknown";
        }

        String body = """
                {"error":{"code":"%s","message":"%s","target":"%s","innererror":{"code":"%s","timestamp":"%s","request_id":"%s"}}}"""
                .formatted(code, message, request.getRequestURI(), innerCode,
                        Instant.now().toString(), requestId);

        response.getWriter().write(body);
    }
}
