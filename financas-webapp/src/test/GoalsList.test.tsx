import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import goalsReducer from '../features/goals/goalsSlice'
import transactionsReducer from '../features/transactions/transactionsSlice'
import authReducer from '../features/auth/authSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import GoalsPage from '../pages/GoalsPage'

const goalFixtures = [
  { id: 1, name: 'Reserva de emergência', targetAmount: 10000, startDate: '2026-07-01', deadline: '2026-12-31', categoryId: null, categoryName: null },
  { id: 2, name: 'Viagem Europa', targetAmount: 5000, startDate: '2026-07-01', deadline: '2026-10-01', categoryId: 1, categoryName: 'Lazer' },
]

const server = setupServer(
  http.get('http://localhost:8080/goals', () => HttpResponse.json(goalFixtures)),
  http.get('http://localhost:8080/transactions', () => HttpResponse.json({ content: [], totalPages: 0, number: 0 })),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function makeStore() {
  return configureStore({
    reducer: { goals: goalsReducer, transactions: transactionsReducer, auth: authReducer, categories: categoriesReducer },
  })
}

function renderPage(store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <GoalsPage />
      </MemoryRouter>
    </Provider>
  )
}

describe('GoalsPage', () => {
  it('renderiza a lista de metas após carregar', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Reserva de emergência')).toBeInTheDocument())
    expect(screen.getByText('Viagem Europa')).toBeInTheDocument()
  })

  it('exibe estado vazio quando não há metas', async () => {
    server.use(http.get('http://localhost:8080/goals', () => HttpResponse.json([])))
    renderPage()
    await waitFor(() => expect(screen.getByText('Nenhuma meta criada ainda.')).toBeInTheDocument())
  })

  it('exibe categoria da meta quando definida', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Lazer')).toBeInTheDocument())
  })
})
