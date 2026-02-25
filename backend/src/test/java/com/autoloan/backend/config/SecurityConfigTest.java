package com.autoloan.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointShouldBePublic() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }

    @Test
    void protectedEndpointShouldBeDenied() throws Exception {
        mockMvc.perform(get("/users/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    void authLoginEndpointShouldBeAccessible() throws Exception {
        // No controller yet, so 404 is expected — but not 403
        mockMvc.perform(get("/auth/login"))
                .andExpect(status().isNotFound());
    }
}
