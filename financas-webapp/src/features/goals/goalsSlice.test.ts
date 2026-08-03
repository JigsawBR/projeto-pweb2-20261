import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { configureStore } from '@reduxjs/toolkit'
import goalsReducer, { fetchGoals, createGoal } from './goalsSlice'

const mockGoal = {
  id: 1,
  name: 'Reserva de emergência',
  targetAmount: 10000,
  startDate: '2026-07-01',
  deadline: '2026-12-31',
  categoryId: null,
  categoryName: null,
}

const server = setupServer(
  http.get('http://localhost:8080/goals', () => HttpResponse.json([mockGoal])),
  http.post('http://localhost:8080/goals', () =>
    HttpResponse.json({ ...mockGoal, id: 2, name: 'Nova meta' }, { status: 201 })
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function makeStore() {
  return configureStore({ reducer: { goals: goalsReducer } })
}

describe('goalsSlice', () => {
  it('estado inicial correto', () => {
    const store = makeStore()
    const state = store.getState().goals
    expect(state.items).toEqual([])
    expect(state.status).toBe('idle')
    expect(state.error).toBeNull()
  })

  it('fetchGoals: carrega metas com sucesso', async () => {
    const store = makeStore()
    await store.dispatch(fetchGoals())
    const state = store.getState().goals
    expect(state.status).toBe('idle')
    expect(state.items).toHaveLength(1)
    expect(state.items[0].name).toBe('Reserva de emergência')
  })

  it('fetchGoals: trata erro da API', async () => {
    server.use(http.get('http://localhost:8080/goals', () => HttpResponse.error()))
    const store = makeStore()
    await store.dispatch(fetchGoals())
    expect(store.getState().goals.status).toBe('failed')
    expect(store.getState().goals.error).toBe('Erro ao carregar metas')
  })

  it('createGoal: adiciona meta ao estado', async () => {
    const store = makeStore()
    await store.dispatch(createGoal({
      name: 'Nova meta',
      targetAmount: 5000,
      deadline: '2026-12-31',
    }))
    const state = store.getState().goals
    expect(state.status).toBe('idle')
    expect(state.items).toHaveLength(1)
    expect(state.items[0].name).toBe('Nova meta')
  })
})
