import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const articlesApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://blog-platform.kata.academy/api',
  }),
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/articles?limit=${limit}&offset=${(page - 1) * limit}`,
      }),
    }),
    getArticle: builder.query({
      query: (slug) => `/articles/${slug}`,
    }),
  }),
})

export const { useGetArticlesQuery, useGetArticleQuery } = articlesApi
