package br.edu.ifpb.financas.api.spendinglimit;

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
@RequestMapping("/spending-limits")
@RequiredArgsConstructor
@Tag(name = "Limites de Gastos", description = "Endpoints para gerenciamento de limites mensais de gastos por categoria")
@SecurityRequirement(name = "bearerAuth")
public class SpendingLimitController {

    private final SpendingLimitService spendingLimitService;

    @Operation(summary = "Listar limites", description = "Retorna todos os limites de gastos do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<SpendingLimitResponse>> listLimits(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(spendingLimitService.listLimits(principal.getUsername()));
    }

    @Operation(summary = "Criar limite", description = "Define um limite mensal de gastos para uma categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Limite criado com sucesso",
                    content = @Content(schema = @Schema(implementation = SpendingLimitResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Categoria não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Já existe limite para esta categoria", content = @Content)
    })
    @PostMapping
    public ResponseEntity<SpendingLimitResponse> createLimit(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateSpendingLimitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(spendingLimitService.createLimit(principal.getUsername(), request));
    }

    @Operation(summary = "Excluir limite", description = "Remove um limite de gastos do usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Limite excluído com sucesso", content = @Content),
            @ApiResponse(responseCode = "401", description = "Não autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Sem permissão para excluir este limite", content = @Content),
            @ApiResponse(responseCode = "404", description = "Limite não encontrado", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLimit(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "ID do limite") @PathVariable Long id) {
        spendingLimitService.deleteLimit(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
