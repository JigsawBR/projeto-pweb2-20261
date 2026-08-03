package br.edu.ifpb.financas.api.spendinglimit;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateSpendingLimitRequest(
        @NotNull @Positive BigDecimal limitAmount,
        @NotNull Long categoryId) {}
