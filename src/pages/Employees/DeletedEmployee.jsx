import React, { useEffect, useState } from "react";
import { getDeletedEmployees, restoreEmployee } from "../../services/employee.services";
import { useNavigate } from "react-router-dom";
import styles from "./DeletedEmployee.module.css";

const DeletedEmployee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState(null);
  const [noData, setNoData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const fetchDeletedEmployees = async () => {
    setLoading(true);
    setError("");
    setNoData(false);
    try {
      const res = await getDeletedEmployees();
      setEmployees(res.data || []);
      setTotalItems(res.data?.length || 0);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setEmployees([]);
        setTotalItems(0);
        setNoData(true);
      } else {
        setError("Failed to fetch deleted employees");
        setEmployees([]);
        setTotalItems(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    setRestoring(id);
    setError("");
    try {
      await restoreEmployee(id);
      fetchDeletedEmployees();
    } catch (err) {
      setError("Failed to restore employee");
    } finally {
      setRestoring(null);
    }
  };

  useEffect(() => {
    fetchDeletedEmployees();
  }, []);

  const departmentOptions = [
    ...new Set(employees.map(emp => emp.department?.departmentName).filter(Boolean))
  ];

  const filteredEmployees = employees.filter(emp => {
    const matchesName = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === "" || emp.department?.departmentName === departmentFilter;
    return matchesName && matchesDepartment;
  });
  const filteredTotalItems = filteredEmployees.length;
  const totalPages = Math.ceil(filteredTotalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={`container-fluid ${styles.container}`}>
      <div className="row justify-content-center">
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>Deleted Employees</div>
            <button
              className={styles.actionBtn}
              onClick={() => navigate("/employees")}
            >
              <i className="bi bi-arrow-left me-1"></i>Back to Employees
            </button>
          </div>
          <div style={{ padding: 24 }} className="table-responsive">
            <table className={`${styles.table} table table-striped table-hover`}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Restore</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : noData || currentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No deleted employees.
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.email}</td>
                      <td><span className={styles.badge}>{emp.department?.departmentName || "N/A"}</span></td>
                      <td>
                        <button
                          className={styles.actionBtn}
                          style={{ minWidth: "100px" }}
                          onClick={() => handleRestore(emp._id)}
                          disabled={restoring === emp._id}
                        >
                          {restoring === emp._id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            "Restore"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredTotalItems > itemsPerPage && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`${styles.pageBtn} ${currentPage === index + 1 ? styles.active : ""}`}
                  onClick={() => handlePageChange(index + 1)}
                  disabled={currentPage === index + 1}
                >
                  {index + 1}
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

export default DeletedEmployee;