import React, { useState, useEffect} from "react";
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import { useTheme } from "../context/ThemeContext";
import {NavLink} from 'react-router-dom';
import "../assets/mainlayout.css";
import { Outlet } from "react-router-dom";
import { FaUser } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../redux/authSlice';
import { userApi } from "../redux/userApi";
import { Tooltip } from "antd";


function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [showProfile , setShowProfile] = useState(false);
 

  const navigate = useNavigate();

 const dispatch = useDispatch();
 const user = useSelector((state) => state.auth.user);

  const handleLogout = () =>{
    localStorage.removeItem("user");
    dispatch(logout());
    dispatch(userApi.util.resetApiState());
    navigate('/login');
  };

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser && !user) {
    dispatch(
      {
        type : "auth/serUser",
        payload : JSON.parse(storedUser)
      }
    )
     }
}, [dispatch,user]);

  return (
    <div className={`dashboard ${theme}`}>

      {/*  Navbar */}
      <div className="navbar">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        <h2>Admin Panel</h2>

        
        <div className="nav-right" style={{cursor: "pointer",textAlign:"right"}}>

          {/* Profile Icon */}
          <Tooltip title={user?.email || "No Email"} placement="left"  >
  <span className="profile-icon">
   
      <FaUser size={18} />
  </span>
</Tooltip>

   {showProfile && (
  <div style={{
    position: "absolute",
    top: "60px",
    right: "20px",
    padding: "10px",
    textAlign : "center",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  }}>
    <p>{user?.email}</p>
     </div>
)}
         
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "light" ? (
              <IoMdMoon size={22} />
            ) : (
              <IoMdSunny size={22} />
            )}
          </button>
      </div>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}

      <div className="main">

        {/*  Sidebar */}
        <div className={`sidebar ${isOpen ? "active" : ""}`} style={{  cursor: "pointer",fontSize:"13px"}}>
          <ul>
            <li><NavLink to="/dashboard" end>➕ Add User</NavLink></li>
            <li><NavLink to="/dashboard/alluser">👥 All Users</NavLink></li>
            <li><NavLink to="/dashboard/chatpage">💬 Chat Page</NavLink></li>
            <li><NavLink to="/dashboard/settings">⚙️ Settings</NavLink></li>
           <li><NavLink to ="/login" onClick={handleLogout}>↩️ Logout</NavLink></li>
          </ul>
        </div>

        {/*  Content */}
        <div className="content">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default MainLayout;