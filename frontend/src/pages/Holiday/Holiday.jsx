import React, { useState, useEffect } from "react";
import HolidayForm from "./HolidayForm";
import HolidayTable from "./HolidayTable";
import styles from "./Holiday.module.css";
import axiosInstance from "../../services/axiosInstance";

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch holidays from API
  const fetchHolidays = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/holiday");
      const arr = Array.isArray(res.data.holiday) ? res.data.holiday : [];
      setHolidays(arr);
    } catch (err) {
      setError("Failed to fetch holidays.");
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Add holiday
  const handleAdd = async (holiday) => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post("/holiday", holiday);
      fetchHolidays();
    } catch (err) {
      setError("Failed to add holiday.");
      setLoading(false);
    }
  };

  // Edit holiday
  const handleEdit = async (holiday) => {
    if (!editingHoliday) return;
    setLoading(true);
    setError("");
    try {
      await axiosInstance.put(`/holiday/${editingHoliday._id}`, holiday);
      setEditingHoliday(null);
      fetchHolidays();
    } catch (err) {
      setError("Failed to update holiday.");
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingHoliday(null);
  };

  // Delete holiday
  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.delete(`/holiday/${id}`);
      fetchHolidays();
    } catch (err) {
      setError("Failed to delete holiday.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.holidayPage} dir="rtl">
      <h2 className={styles.title}>Holiday Management</h2>
      {error && (
        <div style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          {error}
        </div>
      )}
      <div className={styles.formSection}>
        <HolidayForm onAdd={handleAdd} />
      </div>
      {editingHoliday && (
        <div className={styles.formSection}>
          <HolidayForm
            editingHoliday={editingHoliday}
            onEdit={handleEdit}
            onCancel={handleCancelEdit}
            isUpdateForm={true}
          />
        </div>
      )}
      <div className={styles.tableSection}>
        <HolidayTable
          holidays={holidays}
          onEdit={setEditingHoliday}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Holiday;
