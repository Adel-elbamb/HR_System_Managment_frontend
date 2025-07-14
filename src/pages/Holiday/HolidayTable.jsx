import React from "react";
import styles from "./Holiday.module.css";

const HolidayTable = ({ holidays, onEdit, onDelete, loading }) => {
  return (
<div className={styles.tableWrapper}>
  <table className={styles.holidayTable}>
    <thead>
      <tr>
        <th>Actions</th>
        <th>Date</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan="3" className={styles.loadingCell}>
            Loading...
          </td>
        </tr>
      ) : holidays.length === 0 ? (
        <tr>
          <td colSpan="3" className={styles.emptyCell}>
            No holidays found
          </td>
        </tr>
      ) : (
        holidays.map((holiday) => (
          <tr key={holiday._id}>
            <td className="text-center">
              <div className="d-inline-flex align-items-center">
              
                <button
                  className="btn btn-sm btn-outline-secondary rounded-circle me-2"
                  title="Edit"
                  onClick={() => onEdit(holiday)}
                  style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <div></div>
                <button
                  className="btn btn-sm btn-outline-danger rounded-circle"
                  title="Delete"
                  onClick={() => onDelete(holiday._id)}
                  style={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </td>
            <td>{holiday.date}</td>
            <td>{holiday.name}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


  );
};

export default HolidayTable;
