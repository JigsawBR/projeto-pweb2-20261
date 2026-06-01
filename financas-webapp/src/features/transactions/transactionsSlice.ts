import { createSlice } from '@reduxjs/toolkit'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: number
  categoryName: string
  date: string
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

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
})

export default transactionsSlice.reducer
