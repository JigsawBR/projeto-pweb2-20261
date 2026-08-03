package br.edu.ifpb.financas.api;

import br.edu.ifpb.financas.api.spendinglimit.SpendingLimitRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class SpendingLimitControllerTest {

    @Autowired WebApplicationContext wac;
    @Autowired SpendingLimitRepository spendingLimitRepository;
    MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        spendingLimitRepository.deleteAll();
        adminToken = getToken("admin", "password123");
    }

    @Test
    void listLimits_semToken_retorna401() throws Exception {
        mockMvc.perform(get("/spending-limits"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listLimits_comToken_retornaListaVazia() throws Exception {
        mockMvc.perform(get("/spending-limits")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createLimit_comDadosValidos_retorna201() throws Exception {
        mockMvc.perform(post("/spending-limits")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "limitAmount", 800.00,
                                "categoryId", 1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.limitAmount").value(800.00))
                .andExpect(jsonPath("$.categoryId").value(1))
                .andExpect(jsonPath("$.categoryName").value("Alimentação"));
    }

    @Test
    void createLimit_comBodyInvalido_retorna400() throws Exception {
        mockMvc.perform(post("/spending-limits")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "limitAmount", -50))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.categoryId").isNotEmpty());
    }

    @Test
    void createLimit_comCategoriaDuplicada_retorna409() throws Exception {
        mockMvc.perform(post("/spending-limits")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "limitAmount", 800.00,
                                "categoryId", 1))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/spending-limits")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "limitAmount", 1000.00,
                                "categoryId", 1))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void deleteLimit_comIdValido_retorna204() throws Exception {
        Long id = createLimitAndGetId(adminToken, 500.00, 2L);

        mockMvc.perform(delete("/spending-limits/" + id)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteLimit_deOutroUsuario_retorna403() throws Exception {
        Long id = createLimitAndGetId(adminToken, 500.00, 3L);
        String otherToken = registerAndGetToken("del_limit_user_" + System.currentTimeMillis());

        mockMvc.perform(delete("/spending-limits/" + id)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    // --- helpers ---

    private String getToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", username, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private String registerAndGetToken(String username) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("username", username, "password", "senha123", "name", "Outro"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private Long createLimitAndGetId(String token, double limitAmount, Long categoryId) throws Exception {
        MvcResult result = mockMvc.perform(post("/spending-limits")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "limitAmount", limitAmount,
                                "categoryId", categoryId))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
