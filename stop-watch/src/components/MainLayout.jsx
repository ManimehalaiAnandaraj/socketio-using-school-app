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
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
   const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const { data: dbNotifications = [] } = useGetNotificationsQuery();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

    //  LOAD EXISTING NOTIFICATIONS (IMPORTANT)
  useEffect(() => {
    if (dbNotifications.length) {
      setNotifications(dbNotifications.slice(0, 5));
    }
  }, [dbNotifications]);

  //  SOCKET LISTENER
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser?._id) {
      socket.emit("join", storedUser._id);
    }

    const handler = (data) => {
      console.log(" New Notification:", data);

      setNotifications((prev) => [data, ...prev].slice(0, 5));
    };

    socket.on("new_notification", handler);

    return () => {
      socket.off("new_notification", handler);
    };
  }, []);

  //  FIX TYPO
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && !user) {
      dispatch({
        type: "auth/setUser", //  FIXED
        payload: JSON.parse(storedUser),
      });
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(logout());
    dispatch(userApi.util.resetApiState());
    navigate("/login");
  };

  return (
    <div className={`dashboard ${theme}`}>
      {/* Navbar */}
      <div className="navbar">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          <FiMenu size={22} />
        </button>

        <h2>Admin Panel</h2>

        <div className="nav-right">

          {/*  Notification */}
          <div className="bell-container">
            <FaBell 
              size={22}
              onClick={() => setShowNotifications(!showNotifications)}
            />

            {/* Badge */}
{unreadCount > 0 && (
  <span className="badge">{unreadCount}</span>
)}

            {/* Dropdown */}
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

                    {/* View All */}
                    <div
                      className="view-all"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/dashboard/notification", {
                          state: { notifications }, //  PASS DATA
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
          <Tooltip title={user?.email || "No Email"} placement="left">
            <span className="profile-icon">
              <FaUser size={18} />
            </span>
          </Tooltip>

          {/* Theme */}
          <button onClick={toggleTheme} className="theme-btn">
            {theme === "light" ? <IoMdMoon size={20} /> : <IoMdSunny size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="main">
        <div className={`sidebar ${isOpen ? "active" : ""}`}>
          <ul>
            <li onClick={() => setIsOpen(false)}>
              <NavLink to="/dashboard" end><TeamOutlined/> All Users</NavLink>
              </li>
            <li><NavLink to="/dashboard/chatpage"><MessageOutlined/> Chat</NavLink></li>
            <li><NavLink to="/dashboard/notification"><BellOutlined/> Notifications</NavLink></li>
            <li><NavLink to="/dashboard/settings"><SettingOutlined/> Settings</NavLink></li>
            <li><NavLink to="/login" onClick={handleLogout}><LogoutOutlined/> Logout</NavLink></li>
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