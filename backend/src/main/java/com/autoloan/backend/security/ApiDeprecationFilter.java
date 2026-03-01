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
import java.util.List;
import java.util.regex.Pattern;

@Component
@Order(2)
public class ApiDeprecationFilter extends OncePerRequestFilter {

    public record DeprecatedRoute(String method, Pattern path, String date, String sunset, String replacement) {
    }

    private static final List<DeprecatedRoute> DEPRECATED_ROUTES = List.of(
            // Add deprecated routes as needed, e.g.:
            // new DeprecatedRoute("GET", Pattern.compile("^/api/v1/applications/legacy"),
            //         "Sat, 01 Mar 2026 00:00:00 GMT",
            //         "Tue, 01 Sep 2026 00:00:00 GMT",
            //         "/api/v1/applications")
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        DeprecatedRoute match = findMatch(request.getMethod(), request.getRequestURI());

        if (match != null) {
            response.setHeader("Deprecation", match.date());
            if (match.sunset() != null) {
                response.setHeader("Sunset", match.sunset());
            }
            if (match.replacement() != null) {
                response.setHeader("Link", "<" + match.replacement() + ">; rel=\"successor-version\"");
            }
        }

        filterChain.doFilter(request, response);
    }

    DeprecatedRoute findMatch(String method, String path) {
        return DEPRECATED_ROUTES.stream()
                .filter(route -> route.method().equals(method) && route.path().matcher(path).find())
                .findFirst()
                .orElse(null);
    }

    static List<DeprecatedRoute> getDeprecatedRoutes() {
        return DEPRECATED_ROUTES;
    }
}
