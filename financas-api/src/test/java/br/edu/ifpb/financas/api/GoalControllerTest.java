package br.edu.ifpb.financas.api;

import br.edu.ifpb.financas.api.goal.GoalRepository;
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
class GoalControllerTest {

    @Autowired WebApplicationContext wac;
    @Autowired GoalRepository goalRepository;
    MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        goalRepository.deleteAll();
        adminToken = getToken("admin", "password123");
    }

    @Test
    void listGoals_semToken_retorna401() throws Exception {
        mockMvc.perform(get("/goals"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listGoals_comToken_retornaListaVaziaInicial() throws Exception {
        mockMvc.perform(get("/goals")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createGoal_comDadosValidos_retorna201() throws Exception {
        mockMvc.perform(post("/goals")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Reserva de emergência",
                                "targetAmount", 5000.00,
                                "deadline", "2026-12-31"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Reserva de emergência"))
                .andExpect(jsonPath("$.targetAmount").value(5000.00))
                .andExpect(jsonPath("$.startDate").isNotEmpty())
                .andExpect(jsonPath("$.deadline").value("2026-12-31"));
    }

    @Test
    void createGoal_comBodyInvalido_retorna400() throws Exception {
        mockMvc.perform(post("/goals")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "targetAmount", -100))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").isNotEmpty());
    }

    @Test
    void createGoal_comCategoriaValida_retornaGoalComCategoria() throws Exception {
        mockMvc.perform(post("/goals")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Viagem",
                                "targetAmount", 3000.00,
                                "deadline", "2026-12-31",
                                "categoryId", 7))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryId").value(7))
                .andExpect(jsonPath("$.categoryName").value("Lazer"));
    }

    @Test
    void updateGoal_comDadosValidos_retorna200() throws Exception {
        Long id = createGoalAndGetId(adminToken, "Meta original", 1000.00, "2026-12-31");

        mockMvc.perform(put("/goals/" + id)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Meta atualizada",
                                "targetAmount", 2000.00,
                                "deadline", "2027-06-30"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Meta atualizada"))
                .andExpect(jsonPath("$.targetAmount").value(2000.00));
    }

    @Test
    void updateGoal_deOutroUsuario_retorna403() throws Exception {
        Long id = createGoalAndGetId(adminToken, "Meta do admin", 1000.00, "2026-12-31");
        String otherToken = registerAndGetToken("outro_user_goal_" + System.currentTimeMillis());

        mockMvc.perform(put("/goals/" + id)
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Tentativa",
                                "targetAmount", 999.00,
                                "deadline", "2026-12-31"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteGoal_comIdValido_retorna204() throws Exception {
        Long id = createGoalAndGetId(adminToken, "Meta para deletar", 500.00, "2026-06-30");

        mockMvc.perform(delete("/goals/" + id)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteGoal_deOutroUsuario_retorna403() throws Exception {
        Long id = createGoalAndGetId(adminToken, "Meta protegida", 500.00, "2026-06-30");
        String otherToken = registerAndGetToken("del_goal_user_" + System.currentTimeMillis());

        mockMvc.perform(delete("/goals/" + id)
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

    private Long createGoalAndGetId(String token, String name, double targetAmount, String deadline) throws Exception {
        MvcResult result = mockMvc.perform(post("/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", name,
                                "targetAmount", targetAmount,
                                "deadline", deadline))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
