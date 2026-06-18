import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

const selectMonthItems = (state: RootState) => state.transactions.monthItems
const selectItems = (state: RootState) => state.transactions.items

export const selectMonthIncome = createSelector(
  selectMonthItems,
  (items) => items.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
)

export const selectMonthExpense = createSelector(
  selectMonthItems,
  (items) => items.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
)

export const selectMonthBalance = createSelector(
  selectMonthIncome,
  selectMonthExpense,
  (income, expense) => income - expense
)

export const selectRecentTransactions = createSelector(
  selectItems,
  (items) => items.slice(0, 5)
)
