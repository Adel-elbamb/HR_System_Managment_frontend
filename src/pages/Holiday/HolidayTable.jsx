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
            <td>
              <span
                className={styles.actionIcon}
                title="Edit"
                onClick={() => onEdit(holiday)}
              >
                  ✎
              </span>
              <span
                className={styles.actionIconDelete}
                title="Delete"
                onClick={() => onDelete(holiday._id)}
              >
                🗑
              </span>
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
