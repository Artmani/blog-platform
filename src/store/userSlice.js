import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { articlesApi } from './articlesApi'

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

export const registerUser = createAsyncThunk('user/register', async (userData, { dispatch, rejectWithValue }) => {
  try {
    const result = await dispatch(articlesApi.endpoints.register.initiate(userData)).unwrap()
    return result.user
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Registration failed' })
  }
})

export const loginUser = createAsyncThunk('user/login', async (userData, { dispatch, rejectWithValue }) => {
  try {
    const result = await dispatch(articlesApi.endpoints.login.initiate(userData)).unwrap()
    return result.user
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Login failed' })
  }
})

export const getCurrentUser = createAsyncThunk(
  'user/getCurrent',
  async (_, { dispatch, rejectWithValue, getState }) => {
    const { token } = getState().user
    if (!token) {
      console.warn('No token available, skipping getCurrentUser')
      return null
    }
    try {
      const result = await dispatch(articlesApi.endpoints.getCurrentUser.initiate(null)).unwrap()
      if (result && result.user) {
        return result.user
      }
      throw new Error('No user data in response')
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      return rejectWithValue(error.response?.data || { message: 'Failed to load user' })
    }
  }
)

export const updateUser = createAsyncThunk('user/update', async (userData, { dispatch, rejectWithValue }) => {
  try {
    const result = await dispatch(articlesApi.endpoints.updateUser.initiate(userData)).unwrap()
    return result.user
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Update failed' })
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.token = action.payload.token
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        if (action.payload) state.user = action.payload
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to load user'
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { setUser, logout } = userSlice.actions
export default userSlice.reducer
