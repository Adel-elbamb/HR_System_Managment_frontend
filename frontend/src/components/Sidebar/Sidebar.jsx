import React, { useState } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { House, Users, Calendar, FileText, CreditCard, Building2 } from "lucide-react";

const Sidebar = () => {

  const [active, setActive] = useState("Dashboard");


  
  const menuItems = [
    { name: "Dashboard", icon: <House size={20} />, path: "/dashboard" },
    { name: "Employees", icon: <Users size={20} />, path: "/employees" },
    { name: "Attendance", icon: <Calendar size={20} />, path: "/attendance" },
    { name: "Leaves", icon: <FileText size={20} />, path: "/leaves" },
    { name: "Payroll", icon: <CreditCard size={20} />, path: "/payroll" },
    { name: "Departments", icon: <Building2 size={20} />, path: "/departments" },

  ];

  return (
    <div className="sidebar shadow-sm">
      {menuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `sidebar-item${isActive ? " active" : ""} `
          }
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.name}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
