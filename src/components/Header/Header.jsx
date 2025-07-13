import React from "react";
import "./Header.css";
import { Search, Bell, Settings, LogOut, Users } from "lucide-react";
import { authService } from "../../services/authService";

const Header = () => {
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="header shadow-sm">
      <div className="logo-section">
        <div className="logo-icon ">
          <Users size={24} color="white" />
          {/* <img src="/logo/Logo1.png" className="newLogo" alt="" srcset="" /> */}
        </div>
        <div>
          <h5 className="system-title">HR System</h5>
          <small className="system-subtitle">Human Resources Management</small>
        </div>
      </div>

      {/* <div className="search-box">
        <Search size={16} className="search-icon" />
        <input type="text" placeholder="Search employees..." />
      </div> */}

      <div className="header-icons">
        {/* <div className="icon-with-dot">
          <Bell size={18} />
          <span className="dot" />
        </div> */}
        {/* <Settings size={18} className="icon" /> */}
        <LogOut
          size={18}
          className="icon"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default Header;
