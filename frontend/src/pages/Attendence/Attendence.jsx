import React, { useEffect, useState } from "react";
import AddAttendence from "./AddAttendence";
import { getAttendences } from "../../services/Attendence.services";

export default function Attendence() {
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendence, setSelectedAttendence] = useState(null);
  const [attendence, setAttendence] = useState([]);

  const fetchattendence = async () => {
    const data = await getAttendences();
    setAttendence(data);
  };

  useEffect(() => {
    fetchattendence();
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
    fetchattendence(); 
  };

  return (
    <>
      <div className="container shadow-sm p-3 mb-5 bg-body-tertiary rounded mt-5">
        <div className="d-flex align-items-center justify-content-between mt-5">
          <div className="mt-1">
            <h3>Attendance Management</h3>
            <p className="text-muted mb-0">
              Track Employee Attendance And Working Hours
            </p>
          </div>

          <button
            className="btn"
            style={{ background: "#3b82f6", color: "#fff" }}
            onClick={handleAdd}
          >
            Add Attendance
          </button>

          <AddAttendence
            isOpen={showModal}
            onClose={handleCloseModal}
            initialData={selectedAttendence}
          />
        </div>

        <div>
          <table className="table mt-3">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Date</th>
                <th scope="col">Check-in-Time</th>
                <th scope="col">Check-Out-Time</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendence.map((att) => (
                <tr key={att._id}>
                  <td>
                    {att.employeeId?.firstName} {att.employeeId?.lastName}
                  </td>
                  <td>{att.date}</td>
                  <td>{att.checkInTime || "-"}</td>
                  <td>{att.checkOutTime || "-"}</td>
                  <td>
                    

                    <i
                      className="bi bi-pencil-square me-2 text-warning"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(att)} 
                    ></i>

                    <i
                      className="bi bi-trash text-danger"
                      style={{ cursor: "pointer" }}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
