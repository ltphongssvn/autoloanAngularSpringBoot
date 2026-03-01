package com.autoloan.backend.integration;

import com.autoloan.backend.dto.auth.LoginRequest;
import com.autoloan.backend.dto.auth.SignupRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthIntegrationTest extends BaseIntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private HttpResponse<String> post(String path, Object body) throws Exception {
        String json = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseBody(HttpResponse<String> response) throws Exception {
        return objectMapper.readValue(response.body(), Map.class);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> unwrapData(Map<String, Object> body) {
        if (body.containsKey("data") && body.containsKey("status") && body.get("status") instanceof Map) {
            return (Map<String, Object>) body.get("data");
        }
        return body;
    }

    @Test
    @Order(1)
    void signupShouldCreateUserAndReturnToken() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("integration@example.com");
        request.setPassword("password123");
        request.setFirstName("Integration");
        request.setLastName("Test");
        request.setPhone("555-0001");

        HttpResponse<String> response = post("/api/auth/signup", request);
        Map<String, Object> body = parseBody(response);
        Map<String, Object> data = unwrapData(body);

        assertEquals(201, response.statusCode());
        assertNotNull(data.get("token"));
        assertEquals("integration@example.com", data.get("email"));
        assertEquals("Integration", data.get("firstName"));
        assertEquals("CUSTOMER", data.get("role"));
    }

    @Test
    @Order(2)
    void signupShouldRejectDuplicateEmail() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("integration@example.com");
        request.setPassword("password123");
        request.setFirstName("Duplicate");
        request.setLastName("User");
        request.setPhone("555-0002");

        HttpResponse<String> response = post("/api/auth/signup", request);
        Map<String, Object> body = parseBody(response);

        assertEquals(400, response.statusCode());
        assertEquals("Email already registered", body.get("message"));
    }

    @Test
    @Order(3)
    void loginShouldReturnTokenForValidCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("integration@example.com");
        request.setPassword("password123");

        HttpResponse<String> response = post("/api/auth/login", request);
        Map<String, Object> body = parseBody(response);
        Map<String, Object> data = unwrapData(body);

        assertEquals(200, response.statusCode());
        assertNotNull(data.get("token"));
        assertEquals("integration@example.com", data.get("email"));
    }

    @Test
    @Order(4)
    void loginShouldRejectInvalidPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("integration@example.com");
        request.setPassword("wrongpassword");

        HttpResponse<String> response = post("/api/auth/login", request);
        Map<String, Object> body = parseBody(response);

        assertEquals(401, response.statusCode());
        assertEquals("Invalid email or password", body.get("message"));
    }

    @Test
    @Order(5)
    void loginShouldRejectNonexistentEmail() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("nobody@example.com");
        request.setPassword("password123");

        HttpResponse<String> response = post("/api/auth/login", request);

        assertEquals(401, response.statusCode());
    }

    @Test
    @Order(6)
    void signupShouldRejectInvalidInput() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("");
        request.setPassword("");
        request.setFirstName("");
        request.setLastName("");
        request.setPhone("");

        HttpResponse<String> response = post("/api/auth/signup", request);
        Map<String, Object> body = parseBody(response);

        assertEquals(400, response.statusCode());
        assertEquals("Validation Failed", body.get("error"));
    }
}
