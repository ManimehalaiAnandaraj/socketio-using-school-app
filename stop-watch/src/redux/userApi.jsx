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

    //  CREATE USER (for CSV import)
    createUser: builder.mutation({
      query: (newUser) => ({
        url: "/users",   // same endpoint
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

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.token) {
            localStorage.setItem("token", data.token);
          }

          if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }

        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),

    getMe: builder.query({
      query: () => "/users/me",
    }),

    // ================= NOTIFICATIONS =================

    getNotifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notifications"],
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

// ================= EXPORT HOOKS =================

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