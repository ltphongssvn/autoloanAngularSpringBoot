package com.autoloan.backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApiVersioningFilterTest {

    private ApiVersioningFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new ApiVersioningFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
    }

    @Test
    void shouldSetVersionHeadersOnEveryResponse() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("1.0.2", response.getHeader("api-version"));
        assertEquals("1.0, 1.0.1, 1.0.2", response.getHeader("api-supported-versions"));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAllowSupportedVersion() throws Exception {
        request.addHeader("api-version", "1.0.1");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldRejectUnsupportedVersion() throws Exception {
        request.addHeader("api-version", "2.0");
        request.setRequestURI("/api/loans");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(400, response.getStatus());
        String body = response.getContentAsString();
        assertTrue(body.contains("UnsupportedApiVersion"));
        assertTrue(body.contains("2.0"));
        assertTrue(body.contains("/api/loans"));
        assertTrue(body.contains("unknown"));
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void shouldIncludeRequestIdInErrorResponse() throws Exception {
        request.addHeader("api-version", "9.9");
        request.addHeader("x-request-id", "req-abc-123");
        request.setRequestURI("/api/test");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(400, response.getStatus());
        assertTrue(response.getContentAsString().contains("req-abc-123"));
    }

    @Test
    void shouldPassThroughWhenNoVersionHeader() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAllowCurrentVersion() throws Exception {
        request.addHeader("api-version", "1.0.2");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAllowOldestSupportedVersion() throws Exception {
        request.addHeader("api-version", "1.0");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }
}
