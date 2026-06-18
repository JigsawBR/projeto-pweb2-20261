import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export interface Transaction {
  id: number
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: number
  categoryName: string
  date: string
  description: string
  tag?: string
}

export interface CreateTransactionPayload {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: number
  date: string
  description?: string
  tag?: string
}

interface TransactionsState {
  items: Transaction[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
  totalPages: number
  currentPage: number
}

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
  totalPages: 0,
  currentPage: 0,
}

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (page: number = 0, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/transactions', {
        params: { page, size: 10, sort: 'date,desc' },
      })
      return data
    } catch (err: any) {
      return rejectWithValue('Erro ao carregar transações')
    }
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (payload: CreateTransactionPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/transactions', payload)
      return data
    } catch (err: any) {
      const status = err.response?.status
      if (status === 400) return rejectWithValue('Dados inválidos. Verifique os campos.')
      if (status === 404) return rejectWithValue('Categoria não encontrada.')
      return rejectWithValue('Erro ao criar transação')
    }
  }
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTransactions
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'idle'
        // A API retorna um Page do Spring: { content, totalPages, number }
        state.items = action.payload.content
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.number
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      // createTransaction
      .addCase(createTransaction.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createTransaction.fulfilled, (state) => {
        state.status = 'idle'
        state.error = null
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export default transactionsSlice.reducer
