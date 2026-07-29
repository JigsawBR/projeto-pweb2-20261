import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export const selectGoals = (state: RootState) => state.goals.items
const selectMonthItems = (state: RootState) => state.transactions.monthItems

export const selectGoalProgress = (goalId: number) =>
  createSelector(selectGoals, selectMonthItems, (goals, monthItems) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return 0

    const incomeInPeriod = monthItems
      .filter((t) => {
        if (t.type !== 'INCOME') return false
        if (goal.categoryId && t.categoryId !== goal.categoryId) return false
        return true
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const percent = (incomeInPeriod / goal.targetAmount) * 100
    return Math.min(Math.round(percent), 100)
  })
