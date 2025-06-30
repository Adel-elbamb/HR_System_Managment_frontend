import React, { useEffect, useState } from "react";
import styles from "./Attendences.module.css";
import {
  createAttendence,
  updateAttendence,
} from "../../services/Attendence.services";

export default function AddAttendence({ isOpen, onClose, initialData }) {
  if (!isOpen) return null;

  const [employeeId, setEmployeeId] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [status, setStatus] = useState("casual");

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.employeeId?._id || initialData.employeeId || "");
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.heading}>
          {initialData ? "Edit Attendance" : "Add Attendance"}
        </h3>

        <input
          type="text"
          placeholder="Employee ID"
          className={styles.input}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <input
          type="time"
          placeholder="Check-In Time"
          className={styles.input}
          value={checkInTime}
          onChange={(e) => setCheckInTime(e.target.value)}
        />

        <input
          type="time"
          placeholder="Check-Out Time"
          className={styles.input}
          value={checkOutTime}
          onChange={(e) => setCheckOutTime(e.target.value)}
        />

        <select
          className={styles.input}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>

        <button className={styles.submitBtn} onClick={handleSubmit}>
          {initialData ? "Update" : "Submit"}
        </button>
        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}
