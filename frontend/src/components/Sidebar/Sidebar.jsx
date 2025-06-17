import React, { useState } from "react";
import "./Sidebar.css";
import { House, Users, Calendar, FileText, CreditCard, Building2 } from "lucide-react";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <House size={20} /> },
    { name: "Employees", icon: <Users size={20} /> },
    { name: "Attendance", icon: <Calendar size={20} /> },
    { name: "Leaves", icon: <FileText size={20} /> },
    { name: "Payroll", icon: <CreditCard size={20} /> },
    { name: "Departments", icon: <Building2 size={20} /> },
  ];

  return (
    <div className="sidebar shadow-sm">
      {menuItems.map((item) => (
        <div
          key={item.name}
          className={`sidebar-item ${active === item.name ? "active" : ""}`}
          onClick={() => setActive(item.name)}
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
