import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    credentials: "include",

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Users", "Notifications"],

  endpoints: (builder) => ({

    // ================= USERS =================

    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    addUser: builder.mutation({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Users"],
    }),

    createUser: builder.mutation({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: ["Users"],
    }),

    // ================= AUTH =================

    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/users/login",
        method: "POST",
        body: userData,
      }),
      // ✅ No onQueryStarted here — handle in Login.jsx with .unwrap()
    }),

    // ✅ skip: !token must be used wherever this hook is called
    getMe: builder.query({
      query: () => "/users/me",
    }),

    // ================= NOTIFICATIONS =================

    getNotifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notifications"],
      // ✅ skip: !token must be used wherever this hook is called
    }),

    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

  }),
});

export const {
  useGetUsersQuery,
  useAddUserMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,

  useLoginUserMutation,
  useGetMeQuery,

  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} = userApi;