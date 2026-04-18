import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Stopwatch from "./StopWatch";
import Settings from "./pages/Settings";
import MainLayout from "./components/MainLayout";
import AllUser from "./pages/AllUser";
import Login from "./pages/Login";
import ChatPage from "./pages/ChatPage";
import NotificationPage from "./pages/NotificationPage";

import { ThemeProvider } from "./context/ThemeContext";
import { useGetMeQuery } from "./redux/userApi";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/authSlice";

import PrivateRoute from "./pages/PrivateRoute";
import RoleRoute from "./pages/RoleRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    }
  }, [data, dispatch]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <ThemeProvider>
      <ToastContainer position="top-right" autoClose={3000} />

      <BrowserRouter>
        <Routes>
          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* ✅ Default redirect */}
            <Route index element={<Navigate to="alluser" />} />

            {/* USERS */}
            <Route path="alluser" element={<AllUser />} />

            {/* CHAT */}
            <Route
              path="chatpage"
              element={
                <RoleRoute
                  allowedRoles={[
                    "superadmin",
                    "admin",
                    "staff",
                    "student",
                  ]}
                >
                  <ChatPage />
                </RoleRoute>
              }
            />

            {/* NOTIFICATIONS */}
            <Route
              path="notification"
              element={
                <RoleRoute
                  allowedRoles={[
                    "superadmin",
                    "admin",
                    "staff",
                    "student",
                  ]}
                >
                  <NotificationPage />
                </RoleRoute>
              }
            />

            {/* SETTINGS */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Stopwatch />} />
          <Route path="/login" element={<Login />} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;