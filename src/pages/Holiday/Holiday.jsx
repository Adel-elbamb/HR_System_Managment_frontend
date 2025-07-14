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
  const [showError, setShowError] = useState(false);

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

  // Show error popup for 3 seconds
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
      setEditingHoliday(null);
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingHoliday(null);
  };

  // Delete holiday
  const handleDelete = async (id) => {
    console.log(id);
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
    <div className="container-fluid py-4" dir="rtl">
      <div className="row justify-content-center">
        <div className="col-12 d-flex justify-content-center">
          <div
            className="card shadow-lg w-100"
            style={{ maxWidth: '1200px' }}
          >
            <div className="card-body px-2 px-md-4">
              {showError && <div className={styles.errorPopup}>{error}</div>}
              <div className={styles.formSection}>
                <h2 className={styles.title}>Holiday Management</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holiday;
