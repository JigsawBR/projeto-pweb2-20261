package br.edu.ifpb.financas.api.spendinglimit;

import java.math.BigDecimal;

public record SpendingLimitResponse(
        Long id,
        BigDecimal limitAmount,
        Long categoryId,
        String categoryName) {

    public static SpendingLimitResponse from(SpendingLimit limit) {
        return new SpendingLimitResponse(
                limit.getId(),
                limit.getLimitAmount(),
                limit.getCategory().getId(),
                limit.getCategory().getName());
    }
}
