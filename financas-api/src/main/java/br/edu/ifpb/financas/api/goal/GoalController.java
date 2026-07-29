package br.edu.ifpb.financas.api.goal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
@Tag(name = "Metas Financeiras", description = "Endpoints para gerenciamento de metas de poupança")
@SecurityRequirement(name = "bearerAuth")
public class GoalController {

    private final GoalService goalService;

    @Operation(summary = "Listar metas", description = "Retorna todas as metas do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<GoalResponse>> listGoals(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(goalService.listGoals(principal.getUsername()));
    }

    @Operation(summary = "Criar meta", description = "Registra uma nova meta financeira para o usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Meta criada com sucesso",
                    content = @Content(schema = @Schema(implementation = GoalResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada", content = @Content)
    })
    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateGoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.createGoal(principal.getUsername(), request));
    }

    @Operation(summary = "Atualizar meta", description = "Atualiza uma meta do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Meta atualizada com sucesso",
                    content = @Content(schema = @Schema(implementation = GoalResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sem permissão para editar esta meta", content = @Content),
            @ApiResponse(responseCode = "404", description = "Meta ou categoria não encontrada", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "ID da meta") @PathVariable Long id,
            @Valid @RequestBody CreateGoalRequest request) {
        return ResponseEntity.ok(goalService.updateGoal(principal.getUsername(), id, request));
    }

    @Operation(summary = "Excluir meta", description = "Remove uma meta do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Meta excluída com sucesso", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sem permissão para excluir esta meta", content = @Content),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "ID da meta") @PathVariable Long id) {
        goalService.deleteGoal(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
