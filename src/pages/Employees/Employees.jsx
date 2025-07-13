import React, { useEffect, useState } from "react";
import {
  getAllEmployees,
  deleteEmployee,
  updateEmployee,
  getEmployeeById,
} from "../../services/employee.services";
import AddEmployee from "./AddEmployee";
import { useNavigate } from "react-router-dom";
import styles from "./Employees.module.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await getAllEmployees();
      setEmployees(res.data || []);
      setTotalItems(res.data?.length || 0);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = [...employees];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (emp) =>
          emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((emp) => {
        const empDate = emp.hiringDate || emp.createdAt?.slice(0, 10);
        return empDate === dateFilter;
      });
    }

    setFilteredEmployees(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [employees, searchTerm, dateFilter]);

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    fetchEmployees();
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };
  return (
    <div className={styles.employeesPage}>
      <div className={styles.pageTitle}>Employee Management</div>
      <div className={styles.employeesContainer}>
        <div className={styles.header}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="date"
              className={styles.dateInput}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
          <div className={styles.buttonGroup}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/deleted-employees")}
            >
              View Deleted Employees
            </button>
            <button
              className="btn btn-success"
              onClick={() => navigate("/add-employee")}
            >
              Add Employee
            </button>
          </div>
        </div>
        <div style={{ padding: 32 }}>
          <div style={{ marginBottom: 16, color: "#888", fontSize: 14 }}>
            <h4 style={{ color: "#1a2233", marginBottom: 0 }}>Employees</h4>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Hiring Date</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      Loading...
                    </td>
                  </tr>
                ) : currentEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", color: "#888" }}
                    >
                      {filteredEmployees.length === 0
                        ? "No employees match your search criteria."
                        : "No employees found."}
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td className="text-capitalize">{emp.name}</td>
                      <td>
                        <span className={styles.badge}>{emp.department}</span>
                      </td>
                      <td>{emp.hiringDate || emp.createdAt?.slice(0, 10)}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.email}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={`${styles.actionBtnTable} ${styles.view}`}
                            title="View"
                            onClick={() => navigate(`/employee/${emp._id}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className={`${styles.actionBtnTable} ${styles.edit}`}
                            title="Edit"
                            onClick={() =>
                              navigate(`/edit-employee/${emp._id}`)
                            }
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`${styles.actionBtnTable} ${styles.delete}`}
                            title="Delete"
                            onClick={() => handleDelete(emp._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${styles.pageBtn} ${
                    currentPage === i + 1 ? styles.active : ""
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                  disabled={currentPage === i + 1}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
