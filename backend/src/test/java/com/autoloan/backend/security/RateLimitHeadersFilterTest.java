package com.autoloan.backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimitHeadersFilterTest {

    private RateLimitHeadersFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new RateLimitHeadersFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
    }

    @Test
    void shouldSetRateLimitHeaders() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertEquals("60", response.getHeader("X-RateLimit-Limit"));
        assertNotNull(response.getHeader("X-RateLimit-Remaining"));
        assertNotNull(response.getHeader("X-RateLimit-Reset"));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldDecrementRemainingOnSubsequentRequests() throws Exception {
        filter.doFilterInternal(request, response, filterChain);
        assertEquals("59", response.getHeader("X-RateLimit-Remaining"));

        MockHttpServletResponse response2 = new MockHttpServletResponse();
        filter.doFilterInternal(request, response2, filterChain);
        assertEquals("58", response2.getHeader("X-RateLimit-Remaining"));
    }

    @Test
    void shouldTrackDifferentIpsSeparately() throws Exception {
        request.setRemoteAddr("10.0.0.1");
        filter.doFilterInternal(request, response, filterChain);
        assertEquals("59", response.getHeader("X-RateLimit-Remaining"));

        MockHttpServletRequest request2 = new MockHttpServletRequest();
        request2.setRemoteAddr("10.0.0.2");
        MockHttpServletResponse response2 = new MockHttpServletResponse();
        filter.doFilterInternal(request2, response2, filterChain);
        assertEquals("59", response2.getHeader("X-RateLimit-Remaining"));
    }

    @Test
    void shouldResolveIpFromXForwardedFor() {
        request.addHeader("X-Forwarded-For", "203.0.113.50, 70.41.3.18");
        assertEquals("203.0.113.50", filter.resolveClientIp(request));
    }

    @Test
    void shouldFallBackToRemoteAddr() {
        request.setRemoteAddr("127.0.0.1");
        assertEquals("127.0.0.1", filter.resolveClientIp(request));
    }

    @Test
    void shouldReturnUnknownWhenNoIp() {
        MockHttpServletRequest noIpRequest = new MockHttpServletRequest() {
            @Override
            public String getRemoteAddr() {
                return null;
            }
        };
        assertEquals("unknown", filter.resolveClientIp(noIpRequest));
    }

    @Test
    void shouldReturnZeroRemainingWhenLimitExceeded() throws Exception {
        for (int i = 0; i < 60; i++) {
            MockHttpServletResponse r = new MockHttpServletResponse();
            filter.doFilterInternal(request, r, filterChain);
        }

        MockHttpServletResponse overLimitResponse = new MockHttpServletResponse();
        filter.doFilterInternal(request, overLimitResponse, filterChain);
        assertEquals("0", overLimitResponse.getHeader("X-RateLimit-Remaining"));
    }

    @Test
    void windowStartShouldBeTruncatedToHour() {
        long windowStart = filter.getWindowStart();
        assertTrue(windowStart % 3600000 == 0);
    }

    @Test
    void windowResetShouldBeNextHourInSeconds() {
        long reset = filter.getWindowReset();
        long nowSeconds = System.currentTimeMillis() / 1000;
        assertTrue(reset > nowSeconds);
        assertTrue(reset <= nowSeconds + 3600);
    }

    @Test
    void clearCountersShouldResetTracking() throws Exception {
        filter.doFilterInternal(request, response, filterChain);
        assertEquals("59", response.getHeader("X-RateLimit-Remaining"));

        filter.clearCounters();

        MockHttpServletResponse response2 = new MockHttpServletResponse();
        filter.doFilterInternal(request, response2, filterChain);
        assertEquals("59", response2.getHeader("X-RateLimit-Remaining"));
    }

    @Test
    void windowEntryRecordShouldWork() {
        var entry = new RateLimitHeadersFilter.WindowEntry(5, 1000L);
        assertEquals(5, entry.count());
        assertEquals(1000L, entry.windowStart());

        var entry2 = new RateLimitHeadersFilter.WindowEntry(5, 1000L);
        assertEquals(entry, entry2);
        assertEquals(entry.hashCode(), entry2.hashCode());
    }
}
