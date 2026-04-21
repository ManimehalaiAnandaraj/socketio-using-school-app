import React, { useState, useEffect } from "react";
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import { useTheme } from "../context/ThemeContext";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../assets/mainlayout.css";
import { FaUser, FaBell } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { userApi } from "../redux/userApi";
import { Tooltip } from "antd";
import socket from "../socket/socket";
import { BellOutlined, TeamOutlined } from "@ant-design/icons";
import { MessageOutlined } from "@ant-design/icons";
import { SettingOutlined } from "@ant-design/icons";
import { LogoutOutlined } from "@ant-design/icons";
import { useGetNotificationsQuery } from "../redux/userApi";
import { FiMenu } from "react-icons/fi";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // true = full, false = icon-only
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const token = localStorage.getItem("token");
  const { data: dbNotifications = [] } = useGetNotificationsQuery(undefined, {
    skip: !token,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // LOAD EXISTING NOTIFICATIONS
  useEffect(() => {
    if (dbNotifications.length) {
      setNotifications(dbNotifications.slice(0, 5));
    }
  }, [dbNotifications]);

  // SOCKET LISTENER
useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser?._id) {
    socket.emit("join", storedUser._id);
  }

  const handler = (data) => {
    console.log("New Notification:", data);

    // ✅ Only show notification if I am NOT the sender
    if (data?.senderId !== storedUser?._id) {
      setNotifications((prev) => [data, ...prev].slice(0, 5));
    }
  };

  socket.on("new_notification", handler);

  return () => {
    socket.off("new_notification", handler);
  };
}, []);

  // REHYDRATE USER
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      dispatch({
        type: "auth/setUser",
        payload: JSON.parse(storedUser),
      });
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch(logout());
    dispatch(userApi.util.resetApiState());
    navigate("/login");
  };

  return (
    <div className={`dashboard ${theme}`}>
      {/* Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu size={22} />
          </button>
          <h2>Admin Panel</h2>
        </div>

        <div className="nav-right">

           {/* Theme */}
          <button onClick={toggleTheme} className="theme-btn">
            {theme === "light" ? <IoMdMoon size={22} /> : <IoMdSunny size={20} />}
          </button>
          {/* Notification */}
          <div className="bell-container">
            <FaBell
              size={22}
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

            {showNotifications && (
              <div className="dropdown">
                {notifications.length === 0 ? (
                  <p style={{ padding: "10px" }}>No notifications</p>
                ) : (
                  <>
                    {notifications.slice(0, 5).map((n, i) => (
                      <div key={i} className="notification-item">
                        <strong>{n.sender?.name}</strong> sent you a message
                      </div>
                    ))}
                    <div
                      className="view-all"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/dashboard/notification", {
                          state: { notifications },
                        });
                      }}
                    >
                      View All
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <Tooltip title={user?.email || "No Email"} placement="bottom">
            <span className="profile-icon">
              <FaUser size={20} />
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <ul>
            <li>
              <NavLink to="/dashboard/alluser" end>
                <TeamOutlined />
                <span className="link-text"> All Users</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/chatpage">
                <MessageOutlined />
                <span className="link-text"> Chat</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/notification">
                <BellOutlined />
                <span className="link-text"> Notifications</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/settings">
                <SettingOutlined />
                <span className="link-text"> Settings</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" onClick={handleLogout}>
                <LogoutOutlined />
                <span className="link-text"> Logout</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;