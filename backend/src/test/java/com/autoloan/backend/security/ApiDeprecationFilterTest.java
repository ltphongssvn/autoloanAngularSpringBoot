package com.autoloan.backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApiDeprecationFilterTest {

    private ApiDeprecationFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new ApiDeprecationFilter();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
    }

    @Test
    void shouldPassThroughWhenNoDeprecatedRouteMatches() throws Exception {
        request.setMethod("GET");
        request.setRequestURI("/api/loans");
        filter.doFilterInternal(request, response, filterChain);

        assertNull(response.getHeader("Deprecation"));
        assertNull(response.getHeader("Sunset"));
        assertNull(response.getHeader("Link"));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldReturnNullWhenNoMatch() {
        assertNull(filter.findMatch("GET", "/api/loans"));
    }

    @Test
    void deprecatedRoutesListShouldBeEmpty() {
        assertTrue(ApiDeprecationFilter.getDeprecatedRoutes().isEmpty());
    }

    @Test
    void deprecatedRouteRecordShouldStoreAllFields() {
        var route = new ApiDeprecationFilter.DeprecatedRoute(
                "GET",
                Pattern.compile("^/api/v1/legacy"),
                "Sat, 01 Mar 2026 00:00:00 GMT",
                "Tue, 01 Sep 2026 00:00:00 GMT",
                "/api/v1/applications"
        );

        assertEquals("GET", route.method());
        assertEquals("Sat, 01 Mar 2026 00:00:00 GMT", route.date());
        assertEquals("Tue, 01 Sep 2026 00:00:00 GMT", route.sunset());
        assertEquals("/api/v1/applications", route.replacement());
        assertTrue(route.path().matcher("/api/v1/legacy").find());
    }

    @Test
    void deprecatedRouteRecordShouldHandleNullOptionalFields() {
        var route = new ApiDeprecationFilter.DeprecatedRoute(
                "POST",
                Pattern.compile("^/api/old"),
                "Mon, 01 Jan 2026 00:00:00 GMT",
                null,
                null
        );

        assertEquals("POST", route.method());
        assertEquals("Mon, 01 Jan 2026 00:00:00 GMT", route.date());
        assertNull(route.sunset());
        assertNull(route.replacement());
    }

    @Test
    void deprecatedRouteRecordEqualityAndHashCode() {
        var pattern = Pattern.compile("^/test");
        var route1 = new ApiDeprecationFilter.DeprecatedRoute("GET", pattern, "date1", "sunset1", "/new");
        var route2 = new ApiDeprecationFilter.DeprecatedRoute("GET", pattern, "date1", "sunset1", "/new");

        assertEquals(route1, route2);
        assertEquals(route1.hashCode(), route2.hashCode());
        assertEquals(route1.toString(), route2.toString());
    }

    @Test
    void shouldAlwaysContinueFilterChain() throws Exception {
        request.setMethod("DELETE");
        request.setRequestURI("/api/anything");
        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}
