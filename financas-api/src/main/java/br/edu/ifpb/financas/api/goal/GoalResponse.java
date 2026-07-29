package br.edu.ifpb.financas.api.goal;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalResponse(
        Long id,
        String name,
        BigDecimal targetAmount,
        LocalDate startDate,
        LocalDate deadline,
        Long categoryId,
        String categoryName) {

    public static GoalResponse from(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getStartDate(),
                goal.getDeadline(),
                goal.getCategory() != null ? goal.getCategory().getId() : null,
                goal.getCategory() != null ? goal.getCategory().getName() : null);
    }
}
