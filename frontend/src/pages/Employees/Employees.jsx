import React, { useEffect, useState } from "react";
import { getAllEmployees, deleteEmployee, updateEmployee, getEmployeeById } from "../../services/employee.services";
import AddEmployee from "./AddEmployee";
import { useNavigate } from "react-router-dom";



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
      console.error('Error fetching employees:', err);
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
      filtered = filtered.filter(emp => 
        emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(emp => {
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Employee Management</h2>
          <p className="text-muted">Manage your employees, view profiles, and track performance.</p>
        </div>
        <div>
          <button className="btn btn-secondary me-2" onClick={() => navigate("/deleted-employees")}>
            View Deleted Employees
          </button>
        <button className="btn btn-primary " onClick={() => navigate("/add-employee")}>
            Add Employee
          </button>
        </div>
      </div>
  
      <div className="card mb-4 rounded-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Search by Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filter by Date:</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
  
  
      <div className="card shadow-sm rounded-4">
        <div className="card-body">
          <div className="mb-3 text-muted small">
            <h4>Employees</h4>
          </div>
  
          <div className="table-responsive">
            <table className="table table-hover table-borderless align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center">Name</th>
                  <th className="text-center">Department</th>
                  <th className="text-center">Hiring Date</th>
                  <th className="text-center">Phone</th>
                  <th className="text-center">Email</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      {filteredEmployees.length === 0
                        ? "No employees match your search criteria."
                        : "No employees found."}
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td className="text-capitalize text-center">{emp.name}</td>
                      <td className="text-capitalize text-center">{emp.department}</td>
                      <td>{emp.hiringDate || emp.createdAt?.slice(0, 10)}</td>
                      <td>
                          {emp.phone}
                        
                      </td>
                      <td className="text-center">{emp.email}</td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <button
                            className="btn btn-sm btn-light border"
                            title="View"
                            onClick={() => navigate(`/employee/${emp._id}`)}
                          >
                            <i className="fas fa-eye text-muted"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light border"
                            title="Edit"
                            onClick={() => navigate(`/edit-employee/${emp._id}`)}
                          >
                            <i className="fas fa-edit text-secondary"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light border"
                            title="Delete"
                            onClick={() => handleDelete(emp._id)}
                          >
                            <i className="fas fa-trash text-danger"></i>
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
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link bg-secondary text-light" onClick={() => handlePageChange(currentPage - 1)}>
                    Previous
                  </button>
                </li>
  
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                        <button className="page-link bg-white text-dark" onClick={() => handlePageChange(page)}>
                          {page}
                        </button>
                      </li>
                    );
                  } else if (
                    (page === currentPage - 2 && page > 1) ||
                    (page === currentPage + 2 && page < totalPages)
                  ) {
                    return (
                      <li key={page} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                })}
  
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link bg-secondary text-light" onClick={() => handlePageChange(currentPage + 1)}>
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

export default Employees;

