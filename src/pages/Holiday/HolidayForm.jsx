import React, { useState, useEffect } from "react";
import styles from "./Holiday.module.css";

const initialForm = { name: "", date: "" };

function formatDateForInput(date) {
  if (!date) return "";
  // If already in yyyy-MM-dd, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // If in dd/MM/yyyy, convert to yyyy-MM-dd
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
  }
  // Fallback: try to parse as Date
  const d = new Date(date);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return "";
}

const HolidayForm = ({
  onAdd,
  editingHoliday,
  onEdit,
  onCancel,
  isUpdateForm,
}) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editingHoliday) {
      setForm({
        name: editingHoliday.name || "",
        date: formatDateForInput(editingHoliday.date),
      });
    } else {
      setForm(initialForm);
    }
  }, [editingHoliday]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingHoliday) onEdit(form);
    else onAdd(form);
    setForm(initialForm);
  };

  return (
    <form className={styles.holidayForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          type="date"
          name="date"
          placeholder="Date"
          value={form.date}
          onChange={handleChange}
          className={styles.input}
          required
        />
      </div>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        {isUpdateForm ? (
          <>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className={styles.addButton}>
              Update
            </button>
          </>
        ) : (
          <button type="submit" className={styles.addButton}>
            Add
          </button>
        )}
      </div>
    </form>
  );
};

export default HolidayForm;
