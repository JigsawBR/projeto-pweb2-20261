import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface User {
  id: number
  username: string
  name: string
}

interface AuthState {
  token: string | null
  user: User | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const storedToken = localStorage.getItem('token')
const storedUser = (() => {
  try {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
})()

const initialState: AuthState = {
  token: storedToken,
  user: storedUser,
  status: 'idle',
  error: null,
}

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

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload)
      return data
    } catch (err: any) {
      const status = err.response?.status
      if (status === 409) return rejectWithValue('Este email já está em uso.')
      if (status === 400) return rejectWithValue('Dados inválidos. Verifique os campos.')
      return rejectWithValue('Erro ao criar conta. Tente novamente.')
    }
  }
)

function persist(token: string, user: User) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

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
    function onFulfilled(state: AuthState, action: any) {
      const { token, id, username, name } = action.payload
      state.token = token
      state.user = { id, username, name }
      state.status = 'idle'
      state.error = null
      persist(token, { id, username, name })
    }

    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(login.fulfilled, onFulfilled)
      .addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string })
      .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(register.fulfilled, (state) => { state.status = 'idle'; state.error = null })
      .addCase(register.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
