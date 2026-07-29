import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import goalsReducer from '../features/goals/goalsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import authReducer from '../features/auth/authSlice'
import transactionsReducer from '../features/transactions/transactionsSlice'
import NewGoalPage from '../pages/NewGoalPage'

function renderForm() {
  const store = configureStore({
    reducer: { goals: goalsReducer, categories: categoriesReducer, auth: authReducer, transactions: transactionsReducer },
    preloadedState: {
      categories: {
        items: [{ id: 1, name: 'Alimentação' }],
        status: 'idle' as const,
        error: null,
      },
    },
  })
  return { store, ...render(
    <Provider store={store}>
      <MemoryRouter>
        <NewGoalPage />
      </MemoryRouter>
    </Provider>
  )}
}

describe('NewGoalPage', () => {
  it('renderiza todos os campos do formulário', () => {
    renderForm()
    expect(screen.getByLabelText('Nome da meta')).toBeInTheDocument()
    expect(screen.getByLabelText(/Valor-alvo/)).toBeInTheDocument()
    expect(screen.getByLabelText('Data-limite')).toBeInTheDocument()
    expect(screen.getByLabelText('Data de início')).toBeInTheDocument()
  })

  it('não submete o formulário com campos obrigatórios vazios', async () => {
    const user = userEvent.setup()
    const { store } = renderForm()
    await user.click(screen.getByRole('button', { name: /salvar meta/i }))
    expect(store.getState().goals.items).toHaveLength(0)
  })

  it('preenche o campo nome corretamente', async () => {
    const user = userEvent.setup()
    renderForm()
    const input = screen.getByLabelText('Nome da meta')
    await user.type(input, 'Viagem')
    expect(input).toHaveValue('Viagem')
  })
})
