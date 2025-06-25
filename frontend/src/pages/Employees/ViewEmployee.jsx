import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById } from "../../services/employee.services";

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
    <div className="container my-5">
      <div className="card shadow border-0 mx-auto" style={{ maxWidth: 800 }}>
        <div className="card-header bg-secondary text-white">
          <h3 className="mb-0">Employee Details</h3>
        </div>
        <div className="card-body">
          <table className="table table-hover">
            <tbody>
              <tr><th>Name:</th><td>{employee.firstName} {employee.lastName}</td></tr>
              <tr><th>Email:</th><td>{employee.email}</td></tr>
              <tr><th>Phone:</th><td>{employee.phone}</td></tr>
              <tr><th>Department:</th><td>{employee.department?.departmentName || "N/A"}</td></tr>
              <tr><th>Salary:</th><td>{employee.salary}</td></tr>
              <tr><th>Address:</th><td>{employee.address}</td></tr>
              <tr><th>Gender:</th><td>{employee.gender}</td></tr>
              <tr><th>Nationality:</th><td>{employee.nationality}</td></tr>
              <tr><th>National ID:</th><td>{employee.nationalId}</td></tr>
              <tr><th>Birthdate:</th><td>{employee.birthdate}</td></tr>
              <tr><th>Hiredate:</th><td>{employee.hireDate}</td></tr>
              <tr><th>Weekend Days:</th><td>{Array.isArray(employee.weekendDays) ? employee.weekendDays.join(", ") : employee.weekendDays}</td></tr>
              <tr><th>Default Check-In:</th><td>{employee.defaultCheckInTime} AM</td></tr>
              <tr><th>Default Check-Out:</th><td>{employee.defaultCheckOutTime} PM</td></tr>
              <tr><th>Salary Per Hour:</th><td>{employee.salaryPerHour}</td></tr>
            </tbody>
          </table>
          <div className="text-end">
            <button className="btn btn-outline-secondary text-dark mt-3" onClick={() => navigate("/employees")}>
              <i className="bi bi-arrow-left me-2"></i>Employees
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default ViewEmployee; 