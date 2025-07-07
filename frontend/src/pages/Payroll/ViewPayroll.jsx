import React from "react";
import styles from "./Payroll.module.css";

function ViewPayroll({ isOpen, onClose, data }) {
  if (!isOpen) return null;

  // Show loading state if data is not yet available
  if (!data) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h4>Salary Record Details</h4>
          </div>
          <div className={styles.modalContent}>
            <p>Loading salary details...</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.closeBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Validate data fields with fallbacks
  const employeeName = data.employeeId
    ? `${data.employeeId.firstName || "N/A"} ${data.employeeId.lastName || "N/A"}`
    : "N/A";
  const monthYear = data.month && data.year ? `${data.month}/${data.year}` : "N/A";
  const bonus = data.totalBonusAmount != null ? `$${Number(data.totalBonusAmount).toFixed(2)}` : "$0.00";
  const deduction = data.totalDeductionAmount != null ? `$${Number(data.totalDeductionAmount).toFixed(2)}` : "$0.00";
  const absentDays = data.absentDays != null ? data.absentDays : 0;
  const hourlyDiscount = data.totalOvertime != null ? `$${Number(data.totalOvertime).toFixed(2)}/hr` : "$0.00/hr";
  const netSalary = data.netSalary != null ? `$${Number(data.netSalary).toFixed(2)}` : "$0.00";
  const monthDays = data.monthDays != null ? data.monthDays : "N/A";
  const attendedDays = data.attendedDays != null ? data.attendedDays : 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h4>Salary Record Details</h4>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Employee Name:</span>
            <span className={styles.detailValue}>{employeeName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Month/Year:</span>
            <span className={styles.detailValue}>{monthYear}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Bonus:</span>
            <span className={styles.detailValue}>{bonus}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Deduction:</span>
            <span className={styles.detailValue}>{deduction}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Days of Absence:</span>
            <span className={styles.detailValue}>{absentDays}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Hourly Discount:</span>
            <span className={styles.detailValue}>{hourlyDiscount}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Net Salary:</span>
            <span className={styles.detailValue}>{netSalary}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Month Days:</span>
            <span className={styles.detailValue}>{monthDays}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Attended Days:</span>
            <span className={styles.detailValue}>{attendedDays}</span>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewPayroll;