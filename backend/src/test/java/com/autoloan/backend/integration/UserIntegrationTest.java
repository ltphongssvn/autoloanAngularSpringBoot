package com.autoloan.backend.integration;

import com.autoloan.backend.dto.auth.SignupRequest;
import com.autoloan.backend.dto.user.UserUpdateRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UserIntegrationTest extends BaseIntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private String authToken;

    @BeforeAll
    void setUp() throws Exception {
        SignupRequest signup = new SignupRequest();
        signup.setEmail("usertest@example.com");
        signup.setPassword("password123");
        signup.setFirstName("User");
        signup.setLastName("Test");
        signup.setPhone("555-1001");

        HttpResponse<String> signupResponse = post("/api/auth/signup", signup, null);
        assertEquals(201, signupResponse.statusCode(),
                "Signup failed with status " + signupResponse.statusCode() + ": " + signupResponse.body());
        Map<String, Object> body = parseBody(signupResponse);
        authToken = (String) body.get("token");
        assertNotNull(authToken, "Auth token should not be null after signup");
    }

    private HttpResponse<String> post(String path, Object body, String token) throws Exception {
        String json = objectMapper.writeValueAsString(body);
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json));
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + path))
                .GET();
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> put(String path, Object body, String token) throws Exception {
        String json = objectMapper.writeValueAsString(body);
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl() + path))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json));
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseBody(HttpResponse<String> response) throws Exception {
        return objectMapper.readValue(response.body(), Map.class);
    }

    @Test
    @Order(1)
    void getProfileShouldReturnUserInfo() throws Exception {
        HttpResponse<String> response = get("/api/users/me", authToken);
        Map<String, Object> body = parseBody(response);

        assertEquals(200, response.statusCode());
        assertEquals("usertest@example.com", body.get("email"));
        assertEquals("User", body.get("firstName"));
        assertEquals("Test", body.get("lastName"));
    }

    @Test
    @Order(2)
    void getProfileShouldRejectUnauthenticated() throws Exception {
        HttpResponse<String> response = get("/api/users/me", null);

        assertEquals(403, response.statusCode());
    }

    @Test
    @Order(3)
    void updateProfileShouldModifyUserInfo() throws Exception {
        UserUpdateRequest update = new UserUpdateRequest();
        update.setFirstName("Updated");
        update.setLastName("Name");
        update.setPhone("555-9999");

        HttpResponse<String> response = put("/api/users/me", update, authToken);
        Map<String, Object> body = parseBody(response);

        assertEquals(200, response.statusCode());
        assertEquals("Updated", body.get("firstName"));
        assertEquals("Name", body.get("lastName"));
        assertEquals("555-9999", body.get("phone"));
    }

    @Test
    @Order(4)
    void updateProfileShouldRejectInvalidInput() throws Exception {
        UserUpdateRequest update = new UserUpdateRequest();
        update.setFirstName("");
        update.setLastName("");
        update.setPhone("");

        HttpResponse<String> response = put("/api/users/me", update, authToken);

        assertEquals(400, response.statusCode());
    }

    @Test
    @Order(5)
    void updateProfileShouldRejectUnauthenticated() throws Exception {
        UserUpdateRequest update = new UserUpdateRequest();
        update.setFirstName("Hacker");
        update.setLastName("Attempt");
        update.setPhone("555-0000");

        HttpResponse<String> response = put("/api/users/me", update, null);

        assertEquals(403, response.statusCode());
    }
}
