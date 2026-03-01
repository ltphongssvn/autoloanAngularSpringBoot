package com.autoloan.backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecurityHeadersFilterTest {

    private SecurityHeadersFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new SecurityHeadersFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
    }

    @Test
    void shouldSetContentSecurityPolicy() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        String csp = response.getHeader("Content-Security-Policy");
        assertNotNull(csp);
        assertTrue(csp.contains("default-src 'self'"));
        assertTrue(csp.contains("script-src 'self'"));
        assertTrue(csp.contains("frame-ancestors 'self'"));
    }

    @Test
    void shouldSetStrictTransportSecurity() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("max-age=31536000; includeSubDomains",
                response.getHeader("Strict-Transport-Security"));
    }

    @Test
    void shouldSetPermissionsPolicy() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("geolocation=(), microphone=(), camera=(), payment=()",
                response.getHeader("Permissions-Policy"));
    }

    @Test
    void shouldSetCrossOriginHeaders() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("unsafe-none", response.getHeader("Cross-Origin-Embedder-Policy"));
        assertEquals("same-origin-allow-popups", response.getHeader("Cross-Origin-Opener-Policy"));
        assertEquals("cross-origin", response.getHeader("Cross-Origin-Resource-Policy"));
    }

    @Test
    void shouldSetXContentTypeOptions() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("nosniff", response.getHeader("X-Content-Type-Options"));
    }

    @Test
    void shouldSetXFrameOptions() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("SAMEORIGIN", response.getHeader("X-Frame-Options"));
    }

    @Test
    void shouldSetXXssProtection() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("1; mode=block", response.getHeader("X-XSS-Protection"));
    }

    @Test
    void shouldSetReferrerPolicy() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("strict-origin-when-cross-origin", response.getHeader("Referrer-Policy"));
    }

    @Test
    void shouldContinueFilterChain() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}
