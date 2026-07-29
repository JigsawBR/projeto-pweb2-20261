import { describe, it, expect } from 'vitest'
import { selectGoalProgress } from './goalSelectors'
import type { RootState } from '../../app/store'

function makeState(overrides: Partial<RootState> = {}): RootState {
  return {
    auth: { token: null, user: null, status: 'idle', error: null },
    categories: { items: [], status: 'idle', error: null },
    goals: {
      items: [{ id: 1, name: 'Viagem', targetAmount: 2000, startDate: '2026-07-01', deadline: '2026-12-31', categoryId: null, categoryName: null }],
      status: 'idle',
      error: null,
    },
    transactions: {
      items: [],
      monthItems: [],
      status: 'idle',
      monthStatus: 'idle',
      error: null,
      totalPages: 0,
      currentPage: 0,
    },
    ...overrides,
  } as RootState
}

const incomeTransaction = (amount: number) => ({
  id: 1, amount, type: 'INCOME' as const,
  categoryId: 1, categoryName: 'Outros', date: '2026-07-10', description: '',
})

describe('selectGoalProgress', () => {
  it('retorna 0% quando não há receitas', () => {
    const state = makeState()
    const progress = selectGoalProgress(1)(state)
    expect(progress).toBe(0)
  })

  it('retorna progresso parcial', () => {
    const state = makeState({
      transactions: {
        ...makeState().transactions,
        monthItems: [incomeTransaction(1000)],
      },
    } as any)
    const progress = selectGoalProgress(1)(state)
    expect(progress).toBe(50)
  })

  it('retorna 100% quando meta atingida ou ultrapassada', () => {
    const state = makeState({
      transactions: {
        ...makeState().transactions,
        monthItems: [incomeTransaction(3000)],
      },
    } as any)
    const progress = selectGoalProgress(1)(state)
    expect(progress).toBe(100)
  })
})
