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
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(3)
public class RateLimitHeadersFilter extends OncePerRequestFilter {

    static final int RATE_LIMIT_MAX = 60;

    private final ConcurrentHashMap<String, WindowEntry> counters = new ConcurrentHashMap<>();

    record WindowEntry(int count, long windowStart) {
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String ip = resolveClientIp(request);
        long windowStart = getWindowStart();
        long windowReset = getWindowReset();

        WindowEntry entry = counters.compute(ip, (key, existing) -> {
            if (existing == null || existing.windowStart() != windowStart) {
                return new WindowEntry(1, windowStart);
            }
            return new WindowEntry(existing.count() + 1, windowStart);
        });

        int remaining = Math.max(RATE_LIMIT_MAX - entry.count(), 0);

        response.setHeader("X-RateLimit-Limit", String.valueOf(RATE_LIMIT_MAX));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        response.setHeader("X-RateLimit-Reset", String.valueOf(windowReset));

        filterChain.doFilter(request, response);
    }

    String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr : "unknown";
    }

    long getWindowStart() {
        return Instant.now().truncatedTo(ChronoUnit.HOURS).toEpochMilli();
    }

    long getWindowReset() {
        return Instant.now().truncatedTo(ChronoUnit.HOURS).plus(1, ChronoUnit.HOURS).getEpochSecond();
    }

    // visible for testing
    void clearCounters() {
        counters.clear();
    }
}
