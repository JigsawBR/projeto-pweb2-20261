import { createSlice } from '@reduxjs/toolkit'

export interface Category {
  id: number
  name: string
}

interface CategoriesState {
  items: Category[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  error: null,
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
})

export default categoriesSlice.reducer
