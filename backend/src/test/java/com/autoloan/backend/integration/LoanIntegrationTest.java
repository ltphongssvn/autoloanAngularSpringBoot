package com.autoloan.backend.integration;

import com.autoloan.backend.dto.auth.SignupRequest;
import com.autoloan.backend.dto.loan.LoanApplicationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestMethodOrder;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class LoanIntegrationTest extends BaseIntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private String authToken;
    private Number loanId;

    @BeforeAll
    void setUp() throws Exception {
        SignupRequest signup = new SignupRequest();
        signup.setEmail("loantest@example.com");
        signup.setPassword("password123");
        signup.setFirstName("Loan");
        signup.setLastName("Tester");
        signup.setPhone("555-2001");

        HttpResponse<String> response = post("/api/auth/signup", signup, null);
        assertEquals(201, response.statusCode(),
                "Signup failed: " + response.body());
        Map<String, Object> body = parseBody(response);
        authToken = (String) body.get("token");
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

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseBody(HttpResponse<String> response) throws Exception {
        return objectMapper.readValue(response.body(), Map.class);
    }

    private LoanApplicationRequest createValidLoanRequest() {
        LoanApplicationRequest req = new LoanApplicationRequest();
        req.setLoanAmount(new BigDecimal("25000.00"));
        req.setDownPayment(new BigDecimal("5000.00"));
        req.setLoanTerm(36);
        req.setVehicleMake("Toyota");
        req.setVehicleModel("Camry");
        req.setVehicleYear(2024);
        return req;
    }

    @Test
    @Order(1)
    void createLoanShouldReturnCreated() throws Exception {
        HttpResponse<String> response = post("/api/loans", createValidLoanRequest(), authToken);
        Map<String, Object> body = parseBody(response);

        assertEquals(201, response.statusCode());
        assertNotNull(body.get("id"));
        assertEquals("DRAFT", body.get("status"));
        loanId = (Number) body.get("id");
    }

    @Test
    @Order(2)
    @SuppressWarnings("unchecked")
    void getUserLoansShouldReturnList() throws Exception {
        HttpResponse<String> response = get("/api/loans", authToken);
        Map<String, Object> body = parseBody(response);

        assertEquals(200, response.statusCode());
        List<Map<String, Object>> loans = (List<Map<String, Object>>) body.get("data");
        assertNotNull(loans);
        assertFalse(loans.isEmpty());
        assertEquals("DRAFT", loans.get(0).get("status"));
        assertEquals(1, ((Number) body.get("page")).intValue());
        assertTrue(((Number) body.get("total")).intValue() > 0);
    }

    @Test
    @Order(3)
    void getLoanByIdShouldReturnLoan() throws Exception {
        HttpResponse<String> response = get("/api/loans/" + loanId, authToken);
        Map<String, Object> body = parseBody(response);

        assertEquals(200, response.statusCode());
        assertEquals(loanId.intValue(), ((Number) body.get("id")).intValue());
        assertEquals("Toyota", body.get("vehicleMake"));
        assertEquals("Camry", body.get("vehicleModel"));
    }

    @Test
    @Order(4)
    void submitLoanShouldChangeStatus() throws Exception {
        HttpResponse<String> response = post("/api/loans/" + loanId + "/submit", "{}", authToken);
        Map<String, Object> body = parseBody(response);

        assertEquals(200, response.statusCode());
        assertEquals("SUBMITTED", body.get("status"));
    }

    @Test
    @Order(5)
    void createLoanShouldRejectInvalidInput() throws Exception {
        LoanApplicationRequest req = new LoanApplicationRequest();
        req.setLoanAmount(new BigDecimal("100.00"));
        req.setDownPayment(new BigDecimal("0.00"));
        req.setLoanTerm(2);
        req.setVehicleMake("");
        req.setVehicleModel("");
        req.setVehicleYear(1800);

        HttpResponse<String> response = post("/api/loans", req, authToken);

        assertEquals(400, response.statusCode());
    }

    @Test
    @Order(6)
    void createLoanShouldRejectUnauthenticated() throws Exception {
        HttpResponse<String> response = post("/api/loans", createValidLoanRequest(), null);

        assertEquals(403, response.statusCode());
    }

    @Test
    @Order(7)
    void getLoansShouldRejectUnauthenticated() throws Exception {
        HttpResponse<String> response = get("/api/loans", null);

        assertEquals(403, response.statusCode());
    }
}
