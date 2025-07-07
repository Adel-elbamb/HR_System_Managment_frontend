import React, { useEffect, useState } from "react";
import { getDeletedEmployees, restoreEmployee } from "../../services/employee.services";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
    <div className="container py-4">
      <div className="card shadow ">
        <div className="card-header bg-secondary text-white d-flex align-items-center justify-content-between">
          <h2 className="mb-0 h4 text-dark">Deleted Employees</h2>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/employees")}
            style={{ transition: "transform 0.2s" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            <svg
              className="bi bi-arrow-left me-1"
              fill="currentColor"
              height="16"
              width="16"
              viewBox="0 0 16 16"
            >
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back to Employees
          </button>
        </div>
        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
                aria-label="Close"
              ></button>
            </div>
          )}
          <div className="d-flex justify-content-between align-items-start mb-4 gap-3 flex-wrap">
            <div className="input-group w-auto" style={{ maxWidth: "300px" }}>
              <span className="input-group-text">
                <svg
                  className="bi bi-search"
                  fill="currentColor"
                  height="16"
                  width="16"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="d-flex flex-column align-items-end">
              <select
                className="form-select w-auto"
                style={{ minWidth: "200px" }}
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departmentOptions.map(dep => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="table table-hover  align-middle">
              <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th scope="col" className="text-center">Name</th>
                  <th scope="col" className="text-center">Email</th>
                  <th scope="col" className="text-center">Department</th>
                  <th scope="col" className="text-center">Restore</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : noData || currentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No deleted employees.
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map(emp => (
                    <tr key={emp._id}>
                      <td className="text-center">{emp.firstName} {emp.lastName}</td>
                      <td className="text-center">{emp.email}</td>
                      <td className="text-center">{emp.department?.departmentName || "N/A"}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-success text-dark"
                          style={{ minWidth: "100px", transition: "transform 0.2s" }}
                          onClick={() => handleRestore(emp._id)}
                          disabled={restoring === emp._id}
                          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                          onMouseLeave={e => e.target.style.transform = "scale(1)"}
                        >
                          {restoring === emp._id ? (
                            <span className="" role="status" aria-hidden="true"></span>
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
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {totalPages <= 7 ? (
                  [...Array(totalPages)].map((_, index) => (
                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                      <button
                        className="page-link"
                        style={{ minWidth: "40px", transition: "transform 0.2s" }}
                        onClick={() => handlePageChange(index + 1)}
                        onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))
                ) : (
                  <>
                    <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                      <button
                        className="page-link"
                        style={{ minWidth: "40px", transition: "transform 0.2s" }}
                        onClick={() => handlePageChange(1)}
                        onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      >
                        1
                      </button>
                    </li>
                    {currentPage > 4 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum > 1 &&
                        pageNum < totalPages &&
                        pageNum >= currentPage - 1 &&
                        pageNum <= currentPage + 1
                      ) {
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? "active" : ""}`}>
                            <button
                              className="page-link"
                              style={{ minWidth: "40px", transition: "transform 0.2s" }}
                              onClick={() => handlePageChange(pageNum)}
                              onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
                              onMouseLeave={e => e.target.style.transform = "scale(1)"}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      }
                      return null;
                    })}
                    {currentPage < totalPages - 3 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    {totalPages > 1 && (
                      <li className={`page-item ${currentPage === totalPages ? "active" : ""}`}>
                        <button
                          className="page-link"
                          style={{ minWidth: "40px", transition: "transform 0.2s" }}
                          onClick={() => handlePageChange(totalPages)}
                          onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
                          onMouseLeave={e => e.target.style.transform = "scale(1)"}
                        >
                          {totalPages}
                        </button>
                      </li>
                    )}
                  </>
                )}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeletedEmployee;