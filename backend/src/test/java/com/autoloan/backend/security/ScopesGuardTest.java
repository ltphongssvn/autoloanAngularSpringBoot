package com.autoloan.backend.security;

import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.method.HandlerMethod;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ScopesGuardTest {

    private ScopesGuard scopesGuard;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        scopesGuard = new ScopesGuard();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    private HandlerMethod mockHandlerWithMethodScope(String... scopes) {
        RequireScope annotation = mock(RequireScope.class);
        when(annotation.value()).thenReturn(scopes);

        HandlerMethod handlerMethod = mock(HandlerMethod.class);
        when(handlerMethod.getMethodAnnotation(RequireScope.class)).thenReturn(annotation);
        when(handlerMethod.getBeanType()).thenReturn((Class) Object.class);
        return handlerMethod;
    }

    private void setAuthWithScopes(Object scopes) {
        var auth = new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList());
        auth.setDetails(Map.of("scopes", scopes));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void shouldAllowWhenHandlerIsNotHandlerMethod() throws Exception {
        assertTrue(scopesGuard.preHandle(request, response, new Object()));
    }

    @Test
    void shouldAllowWhenNoAnnotationPresent() throws Exception {
        HandlerMethod handlerMethod = mock(HandlerMethod.class);
        when(handlerMethod.getMethodAnnotation(RequireScope.class)).thenReturn(null);
        when(handlerMethod.getBeanType()).thenReturn((Class) Object.class);

        assertTrue(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @Test
    void shouldAllowWhenAnnotationHasEmptyScopes() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope();

        assertTrue(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @Test
    void shouldDenyWhenNoAuthentication() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("read:loans");

        assertFalse(scopesGuard.preHandle(request, response, handlerMethod));
        assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
        assertTrue(response.getContentAsString().contains("InsufficientScope"));
    }

    @Test
    void shouldDenyWhenAuthenticationHasNoDetails() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("read:loans");

        var auth = new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertFalse(scopesGuard.preHandle(request, response, handlerMethod));
        assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
    }

    @Test
    void shouldAllowWhenUserHasRequiredScopesAsList() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("read:loans");
        setAuthWithScopes(List.of("read:loans", "write:loans"));

        assertTrue(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @Test
    void shouldAllowWhenUserHasRequiredScopesAsString() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("read:loans");
        setAuthWithScopes("read:loans,write:loans");

        assertTrue(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @Test
    void shouldDenyWhenUserLacksRequiredScope() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("admin:all");
        setAuthWithScopes(List.of("read:loans"));

        assertFalse(scopesGuard.preHandle(request, response, handlerMethod));
        assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
        assertTrue(response.getContentAsString().contains("\"required\":[\"admin:all\"]"));
        assertTrue(response.getContentAsString().contains("\"available\":[\"read:loans\"]"));
    }

    @Test
    void shouldUseClassAnnotationWhenNoMethodAnnotation() throws Exception {
        HandlerMethod handlerMethod = mock(HandlerMethod.class);
        when(handlerMethod.getMethodAnnotation(RequireScope.class)).thenReturn(null);
        when(handlerMethod.getBeanType()).thenReturn((Class) AnnotatedClass.class);

        setAuthWithScopes(List.of("class:scope"));

        assertTrue(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @Test
    void shouldDenyWhenDetailsMapHasNoScopesKey() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("read:loans");

        var auth = new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList());
        auth.setDetails(Map.of("other", "value"));
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertFalse(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @Test
    void shouldDenyWhenDetailsIsNotMap() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("read:loans");

        var auth = new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList());
        auth.setDetails("not-a-map");
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertFalse(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @Test
    void shouldRequireAllScopes() throws Exception {
        HandlerMethod handlerMethod = mockHandlerWithMethodScope("read:loans", "write:loans");
        setAuthWithScopes(List.of("read:loans"));

        assertFalse(scopesGuard.preHandle(request, response, handlerMethod));
    }

    @RequireScope("class:scope")
    private static class AnnotatedClass {
    }
}
