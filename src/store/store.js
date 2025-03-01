import { configureStore } from '@reduxjs/toolkit'
import { articlesApi } from './articlesApi'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    [articlesApi.reducerPath]: articlesApi.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(articlesApi.middleware),
})
