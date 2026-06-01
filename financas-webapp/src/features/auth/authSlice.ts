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
const storedUser = localStorage.getItem('user')

const initialState: AuthState = {
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials)
      return data
    } catch (err: any) {
      const status = err.response?.status
      if (status === 401) return rejectWithValue('Credenciais inválidas')
      return rejectWithValue('Erro ao fazer login')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { username: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload)
      return data
    } catch (err: any) {
      const status = err.response?.status
      if (status === 409) return rejectWithValue('Username já está em uso')
      return rejectWithValue('Erro ao criar conta')
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
      .addCase(register.fulfilled, onFulfilled)
      .addCase(register.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
