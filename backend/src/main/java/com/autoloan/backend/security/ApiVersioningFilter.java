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

@Component
@Order(1)
public class ApiVersioningFilter extends OncePerRequestFilter {

    private static final String API_VERSION = "1.0.2";
    private static final List<String> SUPPORTED_VERSIONS = List.of("1.0", "1.0.1", "1.0.2");

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        response.setHeader("api-version", API_VERSION);
        response.setHeader("api-supported-versions", String.join(", ", SUPPORTED_VERSIONS));

        String requestedVersion = request.getHeader("api-version");
        if (requestedVersion != null && !SUPPORTED_VERSIONS.contains(requestedVersion)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");

            String requestId = request.getHeader("x-request-id");
            if (requestId == null) {
                requestId = "unknown";
            }

            String body = """
                    {"error":{"code":"UnsupportedApiVersion","message":"API version '%s' is not supported. Supported versions: %s","target":"%s","innererror":{"code":"InvalidVersion","timestamp":"%s","request_id":"%s"}}}"""
                    .formatted(requestedVersion, String.join(", ", SUPPORTED_VERSIONS),
                            request.getRequestURI(), Instant.now().toString(), requestId);

            response.getWriter().write(body);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
