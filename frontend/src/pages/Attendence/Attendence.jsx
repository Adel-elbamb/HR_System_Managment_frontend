import React, { useEffect, useState } from "react";
import AddAttendence from "./AddAttendence";
import {getAttendences} from "../../services/Attendence.services";

export default function Attendence() {
  //
  const [showModal, setShowModal] = useState(false);

  const [attendence, getAttendence] = useState([]);
  const fetchattendence = async () => {
    const data = await getAttendences();
    // console.log(data);

    getAttendence(data);
  };


  useEffect(() => {
    fetchattendence();
  }, []);

  return (
    <>
      <div className="container shadow-sm p-3 mb-5 bg-body-tertiary rounded mt-5">
        <div className="d-flex align-items-center justify-content-between mt-5 ">
          <div className="mt-1">
            <h3 className="">Attendance Management</h3>
            <p className="text-muted mb-0">
              Track Employee Attendance And Working Hours
            </p>
          </div>

          <button
            className="btn"
            style={{ background: "#3b82f6" }}
            onClick={() => setShowModal(true)}
          >
            Add Attendance
          </button>

          <AddAttendence
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        </div>

        <div>
          <table className="table mt-3 ">
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
                      onClick={() => getAttendencesByID(att._id)}
                      className="bi bi-eye me-2 text-primary"
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-pencil-square me-2 text-warning"
                      style={{ cursor: "pointer" }}
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
