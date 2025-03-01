import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const articlesApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://blog-platform.kata.academy/api',
    prepareHeaders: (headers, { getState }) => {
      const { token } = getState().user
      if (token) {
        headers.set('Authorization', `Token ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: ({ offset = 0, limit = 10 }) => `/articles?offset=${offset}&limit=${limit}`,
    }),
    getArticle: builder.query({
      query: (slug) => `/articles/${slug}`,
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: '/users',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/user',
    }),
    updateUser: builder.mutation({
      query: (userData) => ({
        url: '/user',
        method: 'PUT',
        body: userData,
      }),
    }),
    createArticle: builder.mutation({
      query: (articleData) => ({
        url: '/articles',
        method: 'POST',
        body: { article: articleData },
      }),
    }),
    updateArticle: builder.mutation({
      query: ({ slug, articleData }) => ({
        url: `/articles/${slug}`,
        method: 'PUT',
        body: { article: articleData },
      }),
    }),
    deleteArticle: builder.mutation({
      query: (slug) => ({
        url: `/articles/${slug}`,
        method: 'DELETE',
      }),
    }),
    favoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `/articles/${slug}/favorite`,
        method: 'POST',
      }),
    }),
    unfavoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `/articles/${slug}/favorite`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const {
  useGetArticlesQuery,
  useGetArticleQuery,
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
} = articlesApi
