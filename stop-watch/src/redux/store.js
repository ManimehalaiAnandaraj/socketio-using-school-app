import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./userApi";
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    auth : authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});