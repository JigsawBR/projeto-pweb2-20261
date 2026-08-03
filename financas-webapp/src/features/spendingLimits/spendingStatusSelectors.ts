import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export interface SpendingStatus {
  categoryId: number
  categoryName: string
  limitAmount: number
  spent: number
  percentUsed: number
}

const selectLimits = (state: RootState) => state.spendingLimits.items
const selectMonthItems = (state: RootState) => state.transactions.monthItems

/**
 * Cruza os limites de gastos definidos pelo usuário com as transações do mês
 * corrente e retorna, para cada categoria com limite, quanto já foi gasto e o
 * percentual utilizado. Não possui slice próprio: é derivado de
 * `spendingLimits` + `transactions.monthItems`.
 */
export const selectSpendingStatus = createSelector(
  selectLimits,
  selectMonthItems,
  (limits, monthItems): SpendingStatus[] => {
    return limits.map((limit) => {
      const spent = monthItems
        .filter((t) => t.type === 'EXPENSE' && t.categoryId === limit.categoryId)
        .reduce((sum, t) => sum + t.amount, 0)

      const percentUsed = limit.limitAmount > 0 ? Math.round((spent / limit.limitAmount) * 100) : 0

      return {
        categoryId: limit.categoryId,
        categoryName: limit.categoryName,
        limitAmount: limit.limitAmount,
        spent,
        percentUsed,
      }
    })
  }
)

/** Retorna o status de gasto de uma única categoria (usado no formulário de nova transação). */
export const selectSpendingStatusByCategory = (categoryId: number | '') =>
  createSelector(selectSpendingStatus, (statuses) =>
    statuses.find((s) => s.categoryId === categoryId)
  )
