package com.autoloan.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.autoloan.backend.controller")
public class ResponseEnvelopeAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(@NonNull MethodParameter returnType,
                            @NonNull Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(@Nullable Object body,
                                  @NonNull MethodParameter returnType,
                                  @NonNull MediaType selectedContentType,
                                  @NonNull Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  @NonNull ServerHttpRequest request,
                                  @NonNull ServerHttpResponse response) {
        // Only envelope /api/** paths
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String path = httpRequest.getRequestURI();
            if (!path.startsWith("/api/")) {
                return body;
            }
        }

        // Skip wrapping for byte arrays (PDF, file downloads)
        if (body instanceof byte[]) {
            return body;
        }

        // Skip if already enveloped
        if (body instanceof Map<?, ?> map && map.containsKey("status")) {
            Object status = map.get("status");
            if (status instanceof Map<?, ?> statusMap && statusMap.containsKey("code")) {
                return body;
            }
        }

        // Skip wrapping for String responses (handled differently by converter)
        if (body instanceof String) {
            return body;
        }

        int statusCode = 200;
        if (response instanceof ServletServerHttpResponse servletResponse) {
            statusCode = servletResponse.getServletResponse().getStatus();
        }

        // Skip wrapping for error responses (4xx/5xx) — handled by GlobalExceptionHandler
        if (statusCode >= 400) {
            return body;
        }

        String message = messageForStatus(statusCode, body);

        Map<String, Object> envelope = new LinkedHashMap<>();
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("code", statusCode);
        status.put("message", message);
        envelope.put("status", status);
        envelope.put("data", body);

        return envelope;
    }

    private String messageForStatus(int code, Object body) {
        if (body instanceof Map<?, ?> map) {
            Object msg = map.get("message");
            if (msg instanceof String s && !s.isBlank()) {
                return s;
            }
        }

        return switch (code) {
            case 201 -> "Created successfully";
            case 204 -> "Deleted successfully";
            default -> "Success";
        };
    }
}
