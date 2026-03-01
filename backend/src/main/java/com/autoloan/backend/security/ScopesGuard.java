package com.autoloan.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class ScopesGuard implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws IOException {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RequireScope methodAnnotation = handlerMethod.getMethodAnnotation(RequireScope.class);
        RequireScope classAnnotation = handlerMethod.getBeanType().getAnnotation(RequireScope.class);

        RequireScope annotation = methodAnnotation != null ? methodAnnotation : classAnnotation;

        if (annotation == null || annotation.value().length == 0) {
            return true;
        }

        List<String> requiredScopes = Arrays.asList(annotation.value());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<String> userScopes = extractScopes(authentication);

        boolean hasAllScopes = userScopes.containsAll(requiredScopes);

        if (!hasAllScopes) {
            writeForbiddenResponse(response, requiredScopes, userScopes);
            return false;
        }

        return true;
    }

    private List<String> extractScopes(Authentication authentication) {
        if (authentication == null || authentication.getDetails() == null) {
            return Collections.emptyList();
        }

        Object details = authentication.getDetails();
        if (details instanceof Map<?, ?> detailsMap) {
            Object scopes = detailsMap.get("scopes");
            if (scopes instanceof List<?> scopeList) {
                return scopeList.stream()
                        .filter(String.class::isInstance)
                        .map(String.class::cast)
                        .toList();
            }
            if (scopes instanceof String scopeStr && !scopeStr.isBlank()) {
                return Arrays.asList(scopeStr.split(","));
            }
        }

        return Collections.emptyList();
    }

    private void writeForbiddenResponse(HttpServletResponse response,
                                         List<String> required, List<String> available) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");

        String requiredJson = "[" + String.join(",", required.stream().map(s -> "\"" + s + "\"").toList()) + "]";
        String availableJson = "[" + String.join(",", available.stream().map(s -> "\"" + s + "\"").toList()) + "]";

        String body = """
                {"error":{"code":"Forbidden","message":"Insufficient scope for this action.","innererror":{"code":"InsufficientScope","details":[{"required":%s,"available":%s}]}}}""".formatted(requiredJson, availableJson);

        response.getWriter().write(body);
    }
}
