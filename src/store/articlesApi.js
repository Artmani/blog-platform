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
  tagTypes: ['Article', 'Articles'],
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: ({ offset = 0, limit = 10 }) => `/articles?offset=${offset}&limit=${limit}`,
      providesTags: (result) =>
        result
          ? [...result.articles.map(({ slug }) => ({ type: 'Article', id: slug })), { type: 'Articles', id: 'LIST' }]
          : [{ type: 'Articles', id: 'LIST' }],
    }),
    getArticle: builder.query({
      query: (slug) => `/articles/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'Article', id: slug },
        { type: 'Article', id: 'LIST' },
      ],
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
      invalidatesTags: [
        { type: 'Articles', id: 'LIST' },
        { type: 'Article', id: 'LIST' },
      ],
    }),
    createArticle: builder.mutation({
      query: (articleData) => ({
        url: '/articles',
        method: 'POST',
        body: { article: articleData },
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }],
    }),
    updateArticle: builder.mutation({
      query: ({ slug, articleData }) => ({
        url: `/articles/${slug}`,
        method: 'PUT',
        body: { article: articleData },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Article', id: slug }],
    }),
    deleteArticle: builder.mutation({
      query: (slug) => ({
        url: `/articles/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, slug) => [
        { type: 'Article', id: slug },
        { type: 'Articles', id: 'LIST' },
      ],
    }),
    favoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `/articles/${slug}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, slug) => [
        { type: 'Article', id: slug },
        { type: 'Articles', id: 'LIST' },
      ],
    }),
    unfavoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `/articles/${slug}/favorite`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, slug) => [
        { type: 'Article', id: slug },
        { type: 'Articles', id: 'LIST' },
      ],
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
