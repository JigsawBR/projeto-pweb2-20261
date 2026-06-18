import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface AuthState {
  token: string | null
  user: { username: string } | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: (() => { try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null } catch { return null } })(),
  status: 'idle',
  error: null,
}

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload)
      return data
    } catch (err: any) {
      const status = err.response?.status
      if (status === 409) return rejectWithValue('Este username já está em uso.')
      if (status === 400) return rejectWithValue('Dados inválidos. Verifique os campos.')
      return rejectWithValue('Erro ao criar conta. Tente novamente.')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload)
      return data
    } catch (err: any) {
      const status = err.response?.status
      if (status === 401) return rejectWithValue('Username ou senha incorretos.')
      return rejectWithValue('Erro ao fazer login. Tente novamente.')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'idle'
        state.token = action.payload.token
        state.user = { username: action.payload.username }
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify({ username: action.payload.username }))
      })
      .addCase(register.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string })

      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.token = action.payload.token
        state.user = { username: action.payload.username }
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify({ username: action.payload.username }))
      })
      .addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
