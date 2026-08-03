package br.edu.ifpb.financas.api.goal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGoalRequest(
        @NotBlank String name,
        @NotNull @Positive BigDecimal targetAmount,
        @NotNull LocalDate deadline,
        LocalDate startDate,
        Long categoryId) {}
