import React, { useEffect, useState } from "react";
import style from "./Attendences.module.css";
import {
  createAttendence,
  updateAttendence,
} from "../../services/Attendence.services";
import { getAllEmployees } from "../../services/employee.services";

export default function AddAttendence({ isOpen, onClose, initialData }) {
  if (!isOpen) return null;

  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [status, setStatus] = useState("casual");

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await getAllEmployees();

      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.warn("Unexpected employee data format:", data);
        setEmployees([]);
      }
    };

    fetchEmployees();

    if (initialData) {
      setEmployeeId(
        initialData.employeeId?._id || initialData.employeeId || ""
      );
      setCheckInTime(initialData.checkInTime || "");
      setCheckOutTime(initialData.checkOutTime || "");
      setStatus(initialData.status || "casual");
    } else {
      setEmployeeId("");
      setCheckInTime("");
      setCheckOutTime("");
      setStatus("casual");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    const payload = {
      employeeId,
      checkInTime,
      checkOutTime,
      status,
    };

    try {
      if (initialData) {
        await updateAttendence(initialData._id, payload);
      } else {
        await createAttendence(payload);
      }
      onClose();
    } catch (error) {
      console.error(
        "Error saving attendance:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div
      className={style.modalOverlay}
      onClick={onClose} 
    >
      <div
        className={style.modal}
        onClick={(e) => e.stopPropagation()} 
      >
        <h3 className={style.heading}>
          {initialData ? "Edit Attendance" : "Add Attendance"}
        </h3>

        {initialData ? (
          <input
            type="text"
            className={style.input}
            value={
              employees.find((emp) => emp._id === employeeId)?.name
            }
            disabled
          />
        ) : (
          <select
            className={style.input}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        )}

        <input
          type="time"
          placeholder="Check-In Time"
          className={style.input}
          value={checkInTime}
          onChange={(e) => setCheckInTime(e.target.value)}
        />

        <input
          type="time"
          placeholder="Check-Out Time"
          className={style.input}
          value={checkOutTime}
          onChange={(e) => setCheckOutTime(e.target.value)}
        />

        <select
          className={style.input}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>

        <button className={style.submitBtn} onClick={handleSubmit}>
          {initialData ? "Update" : "Submit"}
        </button>
        <button onClick={onClose} className={style.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}
