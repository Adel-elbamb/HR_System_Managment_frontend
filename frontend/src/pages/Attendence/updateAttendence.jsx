import React, { useEffect, useState } from "react";
import styles from "./Attendences.module.css";
import { updateAttendence } from "../../services/Attendence.services";

export default function UpdateAttendence({ isOpen, onClose, initialData }) {
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
    }
  }, [initialData]);

  const handleSubmit = async () => {
    const payload = {
      employeeId,
      checkInTime,
      checkOutTime,
      status,
    };

    try {
      await updateAttendence(initialData._id, payload); // ✅ استخدم ID
      onClose();
    } catch (error) {
      console.error(
        "Error updating attendance:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.heading}>Edit Attendance</h3>

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
          Update
        </button>
        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}
