import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Table, Alert } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { debounce } from "lodash";
import axiosInstance from "./../../services/axiosInstance";
import ViewPayroll from "./ViewPayroll";
import styles from "./Payroll.module.css";

function Payroll() {
  const [payroll, setPayroll] = useState([]);
  const [filteredPayroll, setFilteredPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewPayroll, setViewPayroll] = useState(false);
  const [viewData, setViewData] = useState(null);
  const itemsPerPage = 5;

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredPayroll.slice(offset, offset + itemsPerPage);

  // Fetch payroll data
  const fetchPayroll = async () => {
    try {
      const response = await axiosInstance.get(`/payroll`);
      const payrollData = response.data.data.payroll || [];
      setPayroll(payrollData);
      setFilteredPayroll(payrollData);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch salary records");
      setPayroll([]);
      setFilteredPayroll([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value) => {
      const trimmedName = value.trim();
      if (trimmedName === "") {
        setFilteredPayroll(payroll);
        setCurrentPage(0);
        return;
      }

      const filtered = payroll.filter(
        (record) =>
          record.employeeId &&
          `${record.employeeId.firstName || ""} ${
            record.employeeId.lastName || ""
          }`
            .toLowerCase()
            .includes(trimmedName.toLowerCase())
      );
      setFilteredPayroll(filtered);
      setCurrentPage(0);
    }, 500),
    [payroll]
  );

  // Update search term and trigger search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Debounced date filter handler
  const applyDateFilter = useCallback(
    debounce(async () => {
      if (!fromDate && !toDate) {
        setFilteredPayroll(payroll);
        setCurrentPage(0);
        setError(null);
        return;
      }

      // Validate dates
      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        setError("From date cannot be later than To date");
        setFilteredPayroll([]);
        return;
      }

      try {
        // Transform dates to YYYY-MM format (adjust if backend expects YYYY-MM-DD)
        const from = fromDate ? fromDate.slice(0, 7) : "";
        const to = toDate ? toDate.slice(0, 7) : "";
        const queryParams = new URLSearchParams({
          ...(from && { from }),
          ...(to && { to }),
        });

        const response = await axiosInstance.get(`/payroll?${queryParams}`);
        const filteredData = response.data.data.payroll || [];
        setFilteredPayroll(filteredData);
        setCurrentPage(0);
        setError(null); // Clear error on success
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to fetch filtered salary records"
        );
        setFilteredPayroll([]);
      }
    }, 500),
    [fromDate, toDate, payroll]
  );

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setFilteredPayroll(payroll);
    setCurrentPage(0);
    setError(null);
  };

  // Fetch single payroll record for view
  const handleView = async (id) => {
    console.log("🔍 Fetching payroll for ID:", id); // ← أضف هذا
    try {
      setViewPayroll(false);
      setViewData(null);
      const response = await axiosInstance.get(`/payroll/${id}`);
      const payrollData = response.data.data.payRoll;
      if (!payrollData) {
        throw new Error("No payroll data found");
      }
      setViewData(payrollData);
      setViewPayroll(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch salary details");
      setViewPayroll(false);
      setViewData(null);
    }
  };

  // Handle pagination
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.payrollPage}>
      <div className={styles.pageTitle}>Payroll Management</div>
      <div className={styles.payrollContainer}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end mb-3">
          <div className="col-md-3 ms-auto">
            <div className="input-group input-group-sm rounded-pill bg-light shadow-sm">
              <span className="input-group-text fw-semibold text-primary bg-transparent border-0">
                Employee
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-transparent border-0"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Enter employee name..."
              />
            </div>
          </div>
        </div>

        <div
          className="d-flex align-items-center flex-wrap gap-2"
          style={{ maxWidth: "1000px", marginTop: "20px", marginLeft: "200px" }}
        >
          <div className="position-relative" style={{ width: "170px" }}>
            <div className="input-group input-group-sm rounded-pill shadow-sm">
              <span className="input-group-text bg-white border-0 text-primary fw-semibold">
                From
              </span>
              <input
                type="date"
                className="form-control border-0"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
          </div>

          <div className="position-relative" style={{ width: "170px" }}>
            <div className="input-group input-group-sm rounded-pill shadow-sm">
              <span className="input-group-text bg-white border-0 text-primary fw-semibold">
                To
              </span>
              <input
                type="date"
                className="form-control border-0"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
            style={{ height: "34px", width: "34px" }}
            onClick={applyDateFilter}
          >
            <i className="bi bi-filter"></i>
          </button>

          <button
            className="btn btn-secondary btn-sm rounded-pill"
            onClick={resetFilters}
          >
            <i className="bi bi-x-lg me-1"></i> Reset
          </button>
        </div>

        {error && (
          <Alert variant="danger" className="mt-4">
            {error}
          </Alert>
        )}
        {!error && currentItems.length === 0 && (
          <Alert variant="info" className="mt-4">
            No salary records found for the selected filters. Try adjusting your
            search or date range.
          </Alert>
        )}
        {currentItems.length > 0 && (
          <div className="table-responsive mt-4">
            <Table striped>
              <thead>
                <tr>
                  <th className="text-center">Employee Name</th>
                  <th className="text-center">Department</th>
                  <th className="text-center">Salary</th>
                  <th className="text-center">Attended Days</th>
                  <th className="text-center">Absent Days</th>
                  <th className="text-center">Overtime</th>
                  <th className="text-center">Deduct Time</th>
                  <th className="text-center">Total Bouns</th>
                  <th className="text-center">Total Deduction</th>
                  <th className="text-center">Net salary</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((record) => (
                  <tr key={record._id}>
                    <td className="text-center">
                      {record.employeeId
                        ? `${record.employeeId.firstName || ""} ${
                            record.employeeId.lastName || ""
                          }`
                        : "N/A"}
                    </td>
                    <td className="text-center">
                      {record.employeeId.department.departmentName}
                    </td>
                    <td className="text-center">{record.employeeId.salary}</td>
                    <td className="text-center">{record.attendedDays}</td>
                    <td className="text-center">{record.absentDays}</td>
                    <td className="text-center">{record.totalOvertime}</td>
                    <td className="text-center">{record.totalDeduction}</td>
                    <td className="text-center">
                      {record.totalBonusAmount !== undefined &&
                      record.totalBonusAmount !== null
                        ? Number(record.totalBonusAmount).toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="text-center">
                      {record.totalDeductionAmount !== undefined &&
                      record.totalDeductionAmount !== null
                        ? Number(record.totalDeductionAmount).toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="text-center">
                      {record.netSalary !== undefined &&
                      record.netSalary !== null
                        ? Number(record.netSalary).toFixed(2)
                        : "0.00"}
                    </td>

                    <td className="text-center">
                      <i
                        className="bi bi-eye text-muted"
                        style={{ cursor: "pointer", fontSize: "1.2rem" }}
                        onClick={() => handleView(record._id)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <ReactPaginate
          previousLabel={"«"}
          nextLabel={"»"}
          breakLabel={"..."}
          pageCount={Math.ceil(filteredPayroll.length / itemsPerPage)}
          onPageChange={handlePageClick}
          containerClassName={"pagination justify-content-end mb-2"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item disabled"}
          breakLinkClassName={"page-link"}
          activeClassName={"active"}
        />

        {viewPayroll && (
          <ViewPayroll
            isOpen={viewPayroll}
            onClose={() => {
              setViewPayroll(false);
              setViewData(null);
            }}
            data={viewData}
          />
        )}
      </div>
    </div>
  );
}

export default Payroll;
