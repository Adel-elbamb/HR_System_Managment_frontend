import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById } from "../../services/employee.services";
import styles from "./ViewEmployee.module.css";

const ViewEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await getEmployeeById(id);
        setEmployee(res.data ? res.data[0] : null);
      } catch {
        setError("Failed to fetch employee");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ color: "red", padding: 24 }}>{error}</div>;
  if (!employee) return <div style={{ padding: 24 }}>Employee not found.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>
            <i className="bi bi-person-circle"></i>
          </span>
          <div>
            <div className={styles.headerTitle}>{employee.firstName} {employee.lastName}</div>
            <div className={styles.headerSubtitle}>Employee Details</div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <table className={styles.table}>
            <tbody>
              <tr><th><i className="bi bi-envelope me-2"></i>Email:</th><td>{employee.email}</td></tr>
              <tr><th><i className="bi bi-phone me-2"></i>Phone:</th><td>{employee.phone}</td></tr>
              <tr><th><i className="bi bi-building me-2"></i>Department:</th><td><span className={styles.badge}>{employee.department?.departmentName || "N/A"}</span></td></tr>
              <tr><th><i className="bi bi-cash-coin me-2"></i>Salary:</th><td>{employee.salary}</td></tr>
              <tr><th><i className="bi bi-geo-alt me-2"></i>Address:</th><td>{employee.address}</td></tr>
              <tr><th><i className="bi bi-gender-ambiguous me-2"></i>Gender:</th><td><span className={styles.badge}>{employee.gender}</span></td></tr>
              <tr><th><i className="bi bi-flag me-2"></i>Nationality:</th><td>{employee.nationality}</td></tr>
              <tr><th><i className="bi bi-credit-card-2-front me-2"></i>National ID:</th><td>{employee.nationalId}</td></tr>
              <tr><th><i className="bi bi-calendar-event me-2"></i>Birthdate:</th><td>{employee.birthdate}</td></tr>
              <tr><th><i className="bi bi-calendar-check me-2"></i>Hiredate:</th><td>{employee.hireDate}</td></tr>
              <tr><th><i className="bi bi-calendar-week me-2"></i>Weekend Days:</th><td>{Array.isArray(employee.weekendDays) ? employee.weekendDays.map(day => <span key={day} className={styles.badge}>{day}</span>) : employee.weekendDays}</td></tr>
              <tr><th><i className="bi bi-clock me-2"></i>Default Check-In:</th><td>{employee.defaultCheckInTime} AM</td></tr>
              <tr><th><i className="bi bi-clock-history me-2"></i>Default Check-Out:</th><td>{employee.defaultCheckOutTime} PM</td></tr>
              <tr><th><i className="bi bi-currency-dollar me-2"></i>Salary Per Hour:</th><td>{employee.salaryPerHour}</td></tr>
            </tbody>
          </table>
          <div style={{ textAlign: "end" }}>
            <button className={styles.actionBtn} onClick={() => navigate("/employees")}> 
              <i className="bi bi-arrow-left me-2"></i>Employees
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee; 