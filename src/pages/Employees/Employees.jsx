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
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
        <h1 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 0 }}>Employee Management</h1>
      </div>
      <div style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '16px' }}>
        Manage your employees, view profiles, and track performance.
      </div>
      <div className="d-flex justify-content-end align-items-center gap-3 mb-4 flex-wrap">
        <button
          className="btn btn-outline-danger btn-lg rounded-pill shadow-lg px-4 d-flex align-items-center"
          onClick={() => navigate("/deleted-employees")}
          style={{ fontWeight: 700, letterSpacing: 1, fontSize: '1.1rem' }}
        >
          <i className="fas fa-trash-alt me-2"></i>
          View Deleted Employees
        </button>
        <button
          className="btn btn-primary btn-lg rounded-pill shadow-sm d-flex align-items-center"
          onClick={() => navigate("/add-employee")}
          style={{ fontWeight: 600 }}
        >
          <i className="fas fa-plus me-2"></i>
          Add Employee
        </button>
      </div>
      <div className="card-body">
        <div className="row justify-content-center align-items-center mb-4">
          <div className="col-12 col-md-8">
            <div className="input-group input-group-lg shadow-sm justify-content-center flex-wrap flex-md-nowrap">
              <span className="input-group-text bg-white border-end-0"><i className="fas fa-search"></i></span>
              <input
                type="text"
                className="form-control border-start-0 border-end-0"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 0 }}
              />
              <span className="input-group-text bg-white border-end-0 border-start-0"><i className="fas fa-calendar-alt"></i></span>
              <input
                type="date"
                id="dateFilter"
                className="form-control border-start-0 border-end-0"
                aria-label="Filter by hiring date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ borderRadius: 0, minWidth: 150 }}
              />
              {dateFilter && (
                <button
                  className="btn btn-outline-secondary border-start-0 border-end-0"
                  type="button"
                  onClick={() => setDateFilter("")}
                  tabIndex={0}
                  aria-label="Clear date filter"
                  style={{ borderRadius: 0 }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <button
                className="btn text-white fw-bold"
                type="button"
                onClick={clearFilters}
                style={{ background: '#000', borderTopRightRadius: '2rem', borderBottomRightRadius: '2rem', fontWeight: 600 }}
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>
          <div style={{ padding: 32 }}>
            <div style={{ marginBottom: 16, color: "#888", fontSize: 14 }}>
              <h4 style={{ color: "#1a2233", marginBottom: 0 }}>Employees</h4>
            </div>
            <div className="table-responsive">
              <table className={`${styles.table} table table-striped table-hover`}>
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
