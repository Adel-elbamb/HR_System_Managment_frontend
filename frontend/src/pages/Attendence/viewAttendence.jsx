import React, { useEffect, useState } from "react";
import styles from "./Attendences.module.css";

export default function ViewAttendence({ isOpen, onClose, data }) {
  if (!isOpen) return null;

  return (
<div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.heading}>Attendance Details</h3>

        <div className="mb-3">
          <strong className="text-primary">Employee:</strong>{" "}
          {data?.employeeId?.firstName} {data?.employeeId?.lastName}
        </div>

        <div className="mb-3">
          <strong className="text-primary">Date:</strong> {data?.date}
        </div>

        <div className="mb-3">
          <strong className="text-primary">Check-in Time:</strong> {data?.checkInTime || "-"}
        </div>

        <div className="mb-3">
          <strong className="text-primary">Check-out Time:</strong> {data?.checkOutTime || "-"}
        </div>

        <div className="mb-3">
          <strong className="text-primary">Status:</strong> {data?.status}
        </div>

<button onClick={onClose} className={`${styles.closeBtn} btn btn-primary`}>
          Close
        </button>
      </div>
    </div>
  );
}

