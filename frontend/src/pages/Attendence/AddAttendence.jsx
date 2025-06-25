import React, { useState } from "react";
import styles from "./Attendences.module.css";
import { createAttendence } from "../../services/Attendence.services";

export default function AddAttendence({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [employeeId, setEmployeeId] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [status, setStatus] = useState("casual");

  const handleSubmit = async () => {
    const payload = {
      employeeId,
      checkInTime,
      checkOutTime,
      status,
    };

    // console.log("Sending:", payload);

    try {
      const response = await createAttendence(payload);
      // console.log("Created attendence:", response);
      onClose();
    } catch (error) {
      console.error(
        "Error creating attendence:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.heading}>Add Attendance</h3>

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
          Submit
        </button>
        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}
