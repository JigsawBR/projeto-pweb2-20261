import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export interface Goal {
  id: number
  name: string
  targetAmount: number
  startDate: string
  deadline: string
  categoryId: number | null
  categoryName: string | null
}

export interface CreateGoalPayload {
  name: string
  targetAmount: number
  deadline: string
  startDate?: string
  categoryId?: number | null
}

interface GoalsState {
  items: Goal[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: GoalsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/goals')
      return data as Goal[]
    } catch (err: any) {
      return rejectWithValue('Erro ao carregar metas')
    }
  }
)

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (payload: CreateGoalPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/goals', payload)
      return data as Goal
    } catch (err: any) {
      const status = err.response?.status
      if (status === 400) return rejectWithValue('Dados inválidos. Verifique os campos.')
      if (status === 404) return rejectWithValue('Categoria não encontrada.')
      return rejectWithValue('Erro ao criar meta.')
    }
  }
)

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(fetchGoals.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload })
      .addCase(fetchGoals.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string })
      .addCase(createGoal.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(createGoal.fulfilled, (state, action) => { state.status = 'idle'; state.items.push(action.payload) })
      .addCase(createGoal.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string })
  },
})

export default goalsSlice.reducer
