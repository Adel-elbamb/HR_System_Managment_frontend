import React from "react";
import styles from "../../pages/Employees/AddEmployee.module.css";

const VeryButton = ({ children, onClick, type = "button", variant = "primary", ...props }) => {
  return (
    <button
      className={`${styles.veryButton} ${styles[variant]}`}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default VeryButton; 