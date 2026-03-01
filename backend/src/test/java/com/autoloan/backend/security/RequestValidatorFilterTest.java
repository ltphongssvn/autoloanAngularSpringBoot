package com.autoloan.backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RequestValidatorFilterTest {

    private RequestValidatorFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new RequestValidatorFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
    }

    @Test
    void shouldPassThroughValidGetRequest() throws Exception {
        request.setMethod("GET");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldPassThroughValidJsonPost() throws Exception {
        request.setMethod("POST");
        request.setContentType("application/json");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldPassThroughFormUrlEncoded() throws Exception {
        request.setMethod("PUT");
        request.setContentType("application/x-www-form-urlencoded; charset=UTF-8");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldPassThroughMultipartFormData() throws Exception {
        request.setMethod("POST");
        request.setContentType("multipart/form-data; boundary=----WebKitFormBoundary");
        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldRejectOversizedBody() throws Exception {
        request.setMethod("POST");
        request.setContentType("application/json");
        request.addHeader("content-length", String.valueOf(2 * 1024 * 1024));
        // MockHttpServletRequest needs explicit content length override
        MockHttpServletRequest oversizedRequest = new MockHttpServletRequest() {
            @Override
            public int getContentLength() {
                return 2 * 1024 * 1024;
            }
        };
        oversizedRequest.setMethod("POST");
        oversizedRequest.setContentType("application/json");
        oversizedRequest.setRequestURI("/api/loans");

        filter.doFilterInternal(oversizedRequest, response, filterChain);

        assertEquals(413, response.getStatus());
        assertTrue(response.getContentAsString().contains("PayloadTooLarge"));
        assertTrue(response.getContentAsString().contains("Request body exceeds maximum size of 1MB"));
        assertTrue(response.getContentAsString().contains("unknown"));
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    void shouldRejectOversizedBodyWithRequestId() throws Exception {
        MockHttpServletRequest oversizedRequest = new MockHttpServletRequest() {
            @Override
            public int getContentLength() {
                return 2 * 1024 * 1024;
            }
        };
        oversizedRequest.setMethod("POST");
        oversizedRequest.setContentType("application/json");
        oversizedRequest.setRequestURI("/api/loans");
        oversizedRequest.addHeader("x-request-id", "req-123");

        filter.doFilterInternal(oversizedRequest, response, filterChain);

        assertEquals(413, response.getStatus());
        assertTrue(response.getContentAsString().contains("req-123"));
    }

    @Test
    void shouldRejectUnsupportedContentType() throws Exception {
        request.setMethod("POST");
        request.setContentType("text/xml");
        request.setRequestURI("/api/loans");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(415, response.getStatus());
        assertTrue(response.getContentAsString().contains("UnsupportedMediaType"));
        assertTrue(response.getContentAsString().contains("text/xml"));
        assertTrue(response.getContentAsString().contains("unknown"));
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void shouldRejectUnsupportedContentTypeOnPut() throws Exception {
        request.setMethod("PUT");
        request.setContentType("application/xml");
        request.setRequestURI("/api/users/me");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(415, response.getStatus());
        assertTrue(response.getContentAsString().contains("application/xml"));
    }

    @Test
    void shouldRejectUnsupportedContentTypeOnPatch() throws Exception {
        request.setMethod("PATCH");
        request.setContentType("text/plain");
        request.setRequestURI("/api/loans/1/status");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(415, response.getStatus());
    }

    @Test
    void shouldAllowGetWithUnsupportedContentType() throws Exception {
        request.setMethod("GET");
        request.setContentType("text/xml");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAllowPostWithNoContentType() throws Exception {
        request.setMethod("POST");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(200, response.getStatus());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldIncludeRequestIdInUnsupportedContentTypeError() throws Exception {
        request.setMethod("POST");
        request.setContentType("text/xml");
        request.setRequestURI("/api/test");
        request.addHeader("x-request-id", "req-456");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(415, response.getStatus());
        assertTrue(response.getContentAsString().contains("req-456"));
    }
}
