import React, { useEffect, useState } from "react";
import AddAttendence from "./AddAttendence";
import ViewAttendence from "./viewAttendence";
import {
  getAttendences,
  deleteAttendence,
  getAttendencesById,
  getAttendencesWithFilter,
  getAttendencesByEmployeeName,
} from "../../services/Attendence.services";
import ReactPaginate from 'react-paginate';

export default function Attendence() {
  const [viewAttendence, setViewAttendence] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendence, setSelectedAttendence] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [attendence, setAttendence] = useState([]);
  const [filteredAttendence, setFilteredAttendence] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [errors, setErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredAttendence.slice(offset, offset + itemsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const fetchAttendence = async () => {
    try {
      const data = await getAttendences();
      setAttendence(data || []);
      setFilteredAttendence(data || []);
    } catch (err) {
      console.error("Error fetching attendances:", err);
      setAttendence([]);
      setFilteredAttendence([]);
    }
  };

  useEffect(() => {
    fetchAttendence();
  }, []);

  const handleAdd = () => {
    setSelectedAttendence(null);
    setShowModal(true);
  };

  const handleEdit = (att) => {
    setSelectedAttendence(att);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAttendence(null);
    fetchAttendence();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this attendance?")) {
      try {
        await deleteAttendence(id);
        fetchAttendence();
      } catch (err) {
        console.error("Error deleting attendance:", err);
        alert("Failed to delete attendance. Please try again.");
      }
    }
  };

  const handleView = async (id) => {
    try {
      const data = await getAttendencesById(id);
      setViewData(data);
      setViewAttendence(true);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      alert("Failed to fetch attendance details. Please try again.");
    }
  };

  const applyDateFilter = async () => {
    const newErrors = {};

    if (!start && !end) {
      newErrors.fromDate = "At least one date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      let filtered;
      if (start && end) {
        filtered = await getAttendencesWithFilter(start, end);
      } else if (start && !end) {
        filtered = await getAttendencesWithFilter(start, start);
      } else if (!start && end) {
        filtered = await getAttendencesWithFilter(end, end);
      }
      setFilteredAttendence(filtered || []);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error filtering attendances:", error);
      setFilteredAttendence([]);
    }
  };

  const handleSearchByName = async () => {
    if (!employeeName.trim()) {
      setErrors({ employeeName: "Employee name is required" });
      return;
    }

    try {
      const data = await getAttendencesByEmployeeName(employeeName);
      setFilteredAttendence(data || []);
      setErrors({});
      setCurrentPage(0);
    } catch (error) {
      console.error("Search failed:", error);
      setFilteredAttendence([]);
    }
  };

  const formatDate = (rawDate) => {
    try {
      const datePart = rawDate.includes(": ") ? rawDate.split(": ")[1] : rawDate;
      const [day, month, year] = datePart.includes("/")
        ? datePart.split("/")
        : datePart.split("-");
      const dateObj = new Date(`${year}-${month}-${day}`);
      return isNaN(dateObj) ? "Invalid Date" : dateObj.toLocaleDateString("en-GB");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="container shadow-sm p-4 mb-5 bg-body-tertiary rounded mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end mb-3">
        <div>
          <h3>Attendance Management</h3>
          <p className="text-muted mb-0">Track Employee Attendance And Working Hours</p>
        </div>

        <div className="col-md-3 ms-auto">
          <div className="input-group input-group-sm rounded-pill bg-light shadow-sm">
            <span className="input-group-text fw-semibold text-primary bg-transparent border-0">Employee</span>
            <input
              type="text"
              className="form-control form-control-sm bg-transparent border-0"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter employee name..."
            />
            <button
              className="btn btn-primary btn-sm rounded-end-pill"
              onClick={handleSearchByName}
              style={{ padding: "0.25rem 0.75rem" }}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
          <div style={{ minHeight: "18px" }}>
            {errors.employeeName && <small className="text-danger">{errors.employeeName}</small>}
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center flex-wrap gap-2" style={{ maxWidth: "1000px", marginTop: "20px", marginLeft:"200px" }}>
        <div className="position-relative ms-auto" style={{ width: "170px" }}>
          <div className="input-group input-group-sm rounded-pill shadow-sm">
            <span className="input-group-text bg-white border-0 text-primary fw-semibold">From</span>
            <input
              type="date"
              className="form-control border-0"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          {errors.fromDate && (
            <div style={{ position: "absolute", top: "100%", left: 0 }}>
              <small className="text-danger">{errors.fromDate}</small>
            </div>
          )}
        </div>

        <div className="position-relative" style={{ width: "170px" }}>
          <div className="input-group input-group-sm rounded-pill shadow-sm">
            <span className="input-group-text bg-white border-0 text-primary fw-semibold">To</span>
            <input
              type="date"
              className="form-control border-0"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          {errors.toDate && (
            <div style={{ position: "absolute", top: "100%", left: 0 }}>
              <small className="text-danger">{errors.toDate}</small>
            </div>
          )}
        </div>

        <button
          className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{ height: "34px", width: "34px" }}
          onClick={applyDateFilter}
        >
          <i className="bi bi-filter"></i>
        </button>

        <button
          className="btn btn-primary btn-sm rounded-pill"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg me-1"></i> Add Attendance
        </button>
      </div>

      <div className="table-responsive mt-4">
        <table className="table">
          <thead>
            <tr>
              <th className="text-primary">Employee</th>
              <th className="text-primary">Date</th>
              <th className="text-primary">Check-in</th>
              <th className="text-primary">Check-out</th>
              <th className="text-primary">Status</th>
              <th className="text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((att) => (
                <tr key={att._id}>
                  <td>
                    {att.employeeId
                      ? `${att.employeeId.firstName || ""} ${att.employeeId.lastName || ""}`
                      : "Unknown"}
                  </td>
                  <td>{formatDate(att.date)}</td>
                  <td>{att.checkInTime || "-"}</td>
                  <td>{att.checkOutTime || "-"}</td>
                  <td>{att.status || "N/A"}</td>
                  <td>
                    <i
                      className="bi bi-eye me-2 text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleView(att._id)}
                    ></i>
                    <i
                      className="bi bi-pencil-square me-2 text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(att)}
                    ></i>
                    <i
                      className="bi bi-trash text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(att._id)}
                    ></i>
                  </td>
                </tr>
              ))
            ) : employeeName.trim() !== "" ? (
              <tr>
                <td colSpan="6" className="text-center text-danger">
                  Employee not found
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReactPaginate
        previousLabel={"«"}
        nextLabel={"»"}
        breakLabel={"..."}
        pageCount={Math.ceil(filteredAttendence.length / itemsPerPage)}
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

      {viewAttendence && (
        <ViewAttendence
          isOpen={viewAttendence}
          onClose={() => {
            setViewAttendence(false);
            setViewData(null);
          }}
          data={viewData}
        />
      )}

      <AddAttendence
        isOpen={showModal}
        onClose={handleCloseModal}
        initialData={selectedAttendence}
      />
    </div>
  );
}
