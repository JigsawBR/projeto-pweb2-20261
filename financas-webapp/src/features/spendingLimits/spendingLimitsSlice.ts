import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export interface SpendingLimit {
  id: number
  limitAmount: number
  categoryId: number
  categoryName: string
}

export interface CreateSpendingLimitPayload {
  limitAmount: number
  categoryId: number
}

interface SpendingLimitsState {
  items: SpendingLimit[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: SpendingLimitsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchSpendingLimits = createAsyncThunk(
  'spendingLimits/fetchSpendingLimits',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/spending-limits')
      return data as SpendingLimit[]
    } catch {
      return rejectWithValue('Erro ao carregar limites de gastos')
    }
  }
)

export const createSpendingLimit = createAsyncThunk(
  'spendingLimits/createSpendingLimit',
  async (payload: CreateSpendingLimitPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/spending-limits', payload)
      return data as SpendingLimit
    } catch (err: any) {
      const status = err.response?.status
      if (status === 409) return rejectWithValue('Já existe um limite de gastos para esta categoria.')
      if (status === 404) return rejectWithValue('Categoria não encontrada.')
      if (status === 400) return rejectWithValue('Dados inválidos. Verifique os campos.')
      return rejectWithValue('Erro ao criar limite de gastos.')
    }
  }
)

export const deleteSpendingLimit = createAsyncThunk(
  'spendingLimits/deleteSpendingLimit',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/spending-limits/${id}`)
      return id
    } catch {
      return rejectWithValue('Erro ao excluir limite de gastos.')
    }
  }
)

const spendingLimitsSlice = createSlice({
  name: 'spendingLimits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchSpendingLimits
      .addCase(fetchSpendingLimits.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSpendingLimits.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(fetchSpendingLimits.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      // createSpendingLimit
      .addCase(createSpendingLimit.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createSpendingLimit.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items.push(action.payload)
      })
      .addCase(createSpendingLimit.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      // deleteSpendingLimit
      .addCase(deleteSpendingLimit.fulfilled, (state, action) => {
        state.items = state.items.filter((limit) => limit.id !== action.payload)
      })
      .addCase(deleteSpendingLimit.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export default spendingLimitsSlice.reducer
