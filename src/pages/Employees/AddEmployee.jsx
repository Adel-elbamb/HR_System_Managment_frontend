import React, { useState, useEffect } from "react";
import { addEmployee, getAllDepartments } from "../../services/employee.services";
import { useNavigate } from "react-router-dom";
import { handleBackendValidationErrors, handleGeneralBackendError } from "../../utils/errorHandler";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./AddEmployee.module.css";
import Select from 'react-select';
import VeryButton from '../../components/common/VeryButton';

function getHourDecimal(timeStr) {
  if (!timeStr) return 0;
  const [h, m = 0, s = 0] = timeStr.split(':').map(Number);
  return h + m / 60 + s / 3600;
}

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  salary: "",
  address: "",
  defaultCheckInTime: "",
  defaultCheckOutTime: "",
  gender: "",
  nationality: "",
  nationalId: "",
  birthdate: "",
  department: "",
  weekendDays: "friday,saturday",
  overtimeValue: null,
  overtimeType: "",
  deductionValue: null,
  deductionType: "",
};

const requiredFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "salary",
  "address",
  "defaultCheckInTime",
  "defaultCheckOutTime",
  "gender",
  "nationality",
  "nationalId",
  "birthdate",
  "department",
  "overtimeValue",
  "overtimeType",
  "deductionValue",
  "deductionType"
];

const fieldDisplayNames = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone Number",
  salary: "Salary",
  address: "Address",
  defaultCheckInTime: "Check-in Time",
  defaultCheckOutTime: "Check-out Time",
  gender: "Gender",
  nationality: "Nationality",
  nationalId: "National ID",
  birthdate: "Birthdate",
  department: "Department",
  overtimeValue: "Overtime Value",
  overtimeType: "Overtime Type",
  deductionValue: "Deduction Value",
  deductionType: "Deduction Type"
};

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const overtimeTypeOptions = [
  { value: 'hr', label: 'Hour' },
  { value: 'pound', label: 'Pound' }
];

const deductionTypeOptions = [
  { value: 'hr', label: 'Hour' },
  { value: 'pound', label: 'Pound' }
];

const AddEmployee = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const res = await getAllDepartments();
        setDepartments(res.data || []);
      } catch {
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "overtimeValue" || name === "deductionValue") {
      updatedValue = value === "" ? null : Number(value);
    } else if (name === "salary") {
      updatedValue = value === "" ? "" : Number(value);
    }

    setForm((prev) => ({ ...prev, [name]: updatedValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    
    requiredFields.forEach(field => {
      if (
        form[field] === "" ||
        form[field] === null ||
        form[field] === undefined
      ) {
        errors[field] = `${fieldDisplayNames[field] || field} is required.`;
      }
    });

    if (form.phone && form.phone.length !== 11) {
      errors.phone = "Phone number must be exactly 11 digits.";
    }

    if (form.birthdate) {
      const selectedDate = new Date(form.birthdate);
      const today = new Date();
      if (selectedDate > today) {
        errors.birthdate = "Birthdate cannot be in the future.";
      } else {
        // Check if user is at least 16 years old
        const minBirthdate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        if (selectedDate > minBirthdate) {
          errors.birthdate = "Employee must be at least 16 years old.";
        }
      }
    }

    // Salary, Overtime, Deduction must be > 0
    if (form.salary !== "" && (Number(form.salary) <= 0)) {
      errors.salary = "Salary must be greater than zero.";
    }
    if (form.overtimeValue !== null && (Number(form.overtimeValue) <= 0)) {
      errors.overtimeValue = "Overtime value must be greater than zero.";
    }
    if (form.deductionValue !== null && (Number(form.deductionValue) <= 0)) {
      errors.deductionValue = "Deduction value must be greater than zero.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill in all required fields correctly.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    const submitData = {
      ...form,
      weekendDays: form.weekendDays
        ? form.weekendDays
            .split(",")
            .map(day => day.trim().toLowerCase())
            .filter(Boolean)
        : [],
      overtimeValue: form.overtimeValue !== null ? Number(form.overtimeValue) : undefined,
      deductionValue: form.deductionValue !== null ? Number(form.deductionValue) : undefined,
    };

    if (submitData.salaryPerHour !== undefined) {
      delete submitData.salaryPerHour;
    }
    if (submitData.overtimeValue === undefined) {
      delete submitData.overtimeValue;
    }
    if (submitData.deductionValue === undefined) {
      delete submitData.deductionValue;
    }

    try {
      await addEmployee(submitData);
      navigate("/employees");
      if (onSuccess) onSuccess();
    } catch (err) {
      const backendErrors = err.response?.data;
      let errorsObj = {};
      setError("");
      
      if (backendErrors && typeof backendErrors.message === "string") {
        try {
          const parsed = JSON.parse(backendErrors.message);
          if (Array.isArray(parsed)) {
            parsed.forEach(error => {
              if (error.path && error.path[0] && error.message) {
                const field = error.path[0];
                const message = error.message;
                const errorType = error.type || "";
                
                // Comprehensive user-friendly error mapping
                const fieldDisplayName = {
                  firstName: "First Name",
                  lastName: "Last Name",
                  email: "Email",
                  phone: "Phone Number",
                  salary: "Salary",
                  address: "Address",
                  defaultCheckInTime: "Check-in Time",
                  defaultCheckOutTime: "Check-out Time",
                  gender: "Gender",
                  nationality: "Nationality",
                  nationalId: "National ID",
                  birthdate: "Birthdate",
                  department: "Department",
                  weekendDays: "Weekend Days",
                  overtimeValue: "Overtime Value",
                  overtimeType: "Overtime Type",
                  deductionValue: "Deduction Value",
                  deductionType: "Deduction Type"
                }[field] || field;

                if (field === "phone") {
                  if (errorType === "string.pattern.base" || message.includes("fails to match")) {
                    errorsObj[field] = `${fieldDisplayName} must be exactly 11 digits (e.g., 01234567890).`;
                  } else if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (["overtimeValue", "deductionValue", "salary"].includes(field)) {
                  if (errorType === "number.base" || message.includes("must be a number")) {
                    errorsObj[field] = `${fieldDisplayName} must be a valid number.`;
                  } else if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (field === "email") {
                  if (message.includes("must be a valid email") || message.includes("invalid")) {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  } else if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else if (message.includes("already exists") || message.includes("duplicate")) {
                    errorsObj[field] = `This ${fieldDisplayName.toLowerCase()} is already registered.`;
                  } else {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (["overtimeType", "deductionType"].includes(field)) {
                  if (message.includes("not allowed to be empty") || message.includes("must be one of")) {
                    errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
                  } else {
                    errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (["firstName", "lastName", "nationality"].includes(field)) {
                  if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else if (message.includes("must be a string")) {
                    errorsObj[field] = `${fieldDisplayName} must be text only.`;
                  } else {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (field === "address") {
                  if (message.includes("reapeated address") || message.includes("already exists")) {
                    errorsObj[field] = `This ${fieldDisplayName.toLowerCase()} is already used by another employee.`;
                  } else if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (["defaultCheckInTime", "defaultCheckOutTime"].includes(field)) {
                  if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else if (message.includes("must be a string")) {
                    errorsObj[field] = `Please enter a valid time format (HH:MM) for ${fieldDisplayName.toLowerCase()}.`;
                  } else {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (field === "gender") {
                  if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else if (message.includes("must be one of")) {
                    errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
                  } else {
                    errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (field === "nationalId") {
                  if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else if (message.includes("already exists") || message.includes("duplicate")) {
                    errorsObj[field] = `This ${fieldDisplayName} is already registered.`;
                  } else if (message.includes("fails to match the required pattern")) {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName} format.`;
                  } else {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName}.`;
                  }
                } else if (field === "birthdate") {
                  if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else if (message.includes("must be a valid date")) {
                    errorsObj[field] = `Please enter a valid ${fieldDisplayName.toLowerCase()}.`;
                  } else if (message.includes("future") || message.includes("invalid")) {
                    errorsObj[field] = `Please enter a valid birthdate (cannot be in the future).`;
                  } else {
                    errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (field === "department") {
                  if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
                  } else if (message.includes("must be a valid")) {
                    errorsObj[field] = `Please select a valid ${fieldDisplayName.toLowerCase()}.`;
                  } else {
                    errorsObj[field] = `Please select a ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else if (field === "weekendDays") {
                  if (message.includes("invalid")) {
                    errorsObj[field] = `Please enter valid ${fieldDisplayName.toLowerCase()} (comma-separated).`;
                  } else if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} are required.`;
                  } else {
                    errorsObj[field] = `Please enter valid ${fieldDisplayName.toLowerCase()}.`;
                  }
                } else {
                  if (message.includes("not allowed to be empty")) {
                    errorsObj[field] = `${fieldDisplayName} is required.`;
                  } else if (message.includes("must be a number")) {
                    errorsObj[field] = `${fieldDisplayName} must be a valid number.`;
                  } else if (message.includes("must be a string")) {
                    errorsObj[field] = `${fieldDisplayName} must be text only.`;
                  } else {
                    errorsObj[field] = `Invalid ${fieldDisplayName.toLowerCase()}.`;
                  }
                }
              }
            });
          }
          setFieldErrors(errorsObj);
          return;
        } catch (e) {
        }
      }

      if (Array.isArray(backendErrors)) {
        const errorsObj = handleBackendValidationErrors(backendErrors);
        setFieldErrors(errorsObj);
        setError("");
      } else {
        const errorMessage = handleGeneralBackendError(err);
        setError(errorMessage);
        setFieldErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  const departmentOptions = departments.map(dept => ({ value: dept._id, label: dept.departmentName }));

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 52,
      height: 52,
      borderRadius: 8,
      borderColor: state.isFocused ? '#28a1de' : '#111',
      boxShadow: 'none',
      '&:hover': { borderColor: '#28a1de' },
    }),
    valueContainer: (base) => ({
      ...base,
      height: 52,
      padding: '0 12px',
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      color: '#111',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#111',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#111',
      fontSize: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      left: 16,
      position: 'absolute',
    }),
  };

  return (
    <div className={styles.pageBackground}>
      <div className={styles.centerCard}>
          <div className={styles.headerRow}>
            <h3 className="mb-0 h4 text-center text-dark">Add Employee</h3>
          </div>
          <div className="card shadow border-0 rounded-3">
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <ErrorDisplay error={fieldErrors.firstName} />
                    <div className={styles.inputGroup}>
                      <input
                        name="firstName"
                        className={styles.outlinedInput}
                        placeholder=" "
                        value={form.firstName || ""}
                        onChange={handleChange}
                      />
                      <label className={styles.outlinedLabel}>First Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <ErrorDisplay error={fieldErrors.lastName} />
                    <div className={styles.inputGroup}>
                      <input
                        name="lastName"
                        className={styles.outlinedInput}
                        placeholder=" "
                        value={form.lastName || ""}
                        onChange={handleChange}
                      />
                      <label className={styles.outlinedLabel}>Last Name</label>
                    </div>
                  </div>
                </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.email} />
                <div className={styles.inputGroup}>
                  <input
                    name="email"
                    className={styles.outlinedInput}
                    placeholder=" "
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                  />
                  <label className={styles.outlinedLabel}>Email</label>
                </div>
              </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.phone} />
                <div className={styles.inputGroup}>
                  <input
                    name="phone"
                    className={styles.outlinedInput}
                    placeholder=" "
                    value={form.phone}
                    onChange={handleChange}
                    maxLength="11"
                    pattern="[0-9]{11}"
                  />
                  <label className={styles.outlinedLabel}>Phone Number (11 digits)</label>
                </div>
              </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.salary} />
                <div className={styles.inputGroup}>
                  <input
                    name="salary"
                    className={styles.outlinedInput}
                    placeholder=" "
                    value={form.salary}
                    onChange={handleChange}
                    type="number"
                    min="1"
                  />
                  <label className={styles.outlinedLabel}>Salary</label>
                </div>
              </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.address} />
                <div className={styles.inputGroup}>
                  <input
                    name="address"
                    className={styles.outlinedInput}
                    placeholder=" "
                    value={form.address}
                    onChange={handleChange}
                  />
                  <label className={styles.outlinedLabel}>Address</label>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.defaultCheckInTime} />
                  <div className={styles.inputGroup}>
                    <input
                      name="defaultCheckInTime"
                      className={styles.outlinedInput}
                      placeholder=" "
                      value={form.defaultCheckInTime}
                      onChange={handleChange}
                      type="time"
                    />
                    <label className={styles.outlinedLabel}>Check-In Time</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.defaultCheckOutTime} />
                  <div className={styles.inputGroup}>
                    <input
                      name="defaultCheckOutTime"
                      className={styles.outlinedInput}
                      placeholder=" "
                      value={form.defaultCheckOutTime}
                      onChange={handleChange}
                      type="time"
                    />
                    <label className={styles.outlinedLabel}>Check-Out Time</label>
                  </div>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.gender} />
                  <div className={styles.inputGroup}>
                    <Select
                      options={genderOptions}
                      value={genderOptions.find(opt => opt.value === form.gender) || null}
                      onChange={option => handleChange({ target: { name: 'gender', value: option ? option.value : '' } })}
                      placeholder="Gender"
                      styles={{
                        ...customSelectStyles,
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                      }}
                      isClearable={false}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.nationality} />
                  <div className={styles.inputGroup}>
                    <input
                      name="nationality"
                      className={styles.outlinedInput}
                      placeholder=" "
                      value={form.nationality}
                      onChange={handleChange}
                    />
                    <label className={styles.outlinedLabel}>Nationality</label>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.nationalId} />
                <div className={styles.inputGroup}>
                  <input
                    name="nationalId"
                    className={styles.outlinedInput}
                    placeholder=" "
                    value={form.nationalId}
                    onChange={handleChange}
                  />
                  <label className={styles.outlinedLabel}>National ID</label>
                </div>
              </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.birthdate} />
                <div className={styles.inputGroup}>
                  <input
                    id="birthdate"
                    name="birthdate"
                    className={styles.outlinedInput}
                    placeholder=" "
                    value={form.birthdate}
                    onChange={handleChange}
                    type="text"
                    pattern="\d{4}-\d{2}-\d{2}"
                    onFocus={(e) => e.target.type = "date"}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        e.target.type = "text";
                      }
                    }}
                  />
                  <label className={styles.outlinedLabel}>Birthdate</label>
                </div>
              </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.department} />
                <div className={styles.inputGroup}>
                  <Select
                    options={departmentOptions}
                    value={departmentOptions.find(opt => opt.value === form.department) || null}
                    onChange={option => handleChange({ target: { name: 'department', value: option ? option.value : '' } })}
                    placeholder={departmentsLoading ? 'Loading departments...' : 'Department'}
                    styles={{
                      ...customSelectStyles,
                      menuPortal: base => ({ ...base, zIndex: 9999 })
                    }}
                    isClearable={false}
                    isDisabled={departmentsLoading}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
              <div className="mb-3">
                <ErrorDisplay error={fieldErrors.weekendDays} />
                <div className={styles.inputGroup}>
                  <input
                    name="weekendDays"
                    className={styles.outlinedInput}
                    placeholder=" "
                    value={form.weekendDays}
                    onChange={handleChange}
                  />
                  <label className={styles.outlinedLabel}>Weekend Days (comma separated)</label>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.overtimeValue} />
                  <div className={styles.inputGroup}>
                    <input
                      name="overtimeValue"
                      className={styles.outlinedInput}
                      placeholder=" "
                      value={form.overtimeValue ?? ""}
                      onChange={handleChange}
                      type="number"
                      min="1"
                    />
                    <label className={styles.outlinedLabel}>Overtime Value</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.overtimeType} />
                  <div className={styles.inputGroup}>
                    <Select
                      options={overtimeTypeOptions}
                      value={overtimeTypeOptions.find(opt => opt.value === form.overtimeType) || null}
                      onChange={option => handleChange({ target: { name: 'overtimeType', value: option ? option.value : '' } })}
                      placeholder="Overtime Type"
                      styles={{
                        ...customSelectStyles,
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                      }}
                      isClearable={false}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.deductionValue} />
                  <div className={styles.inputGroup}>
                    <input
                      name="deductionValue"
                      className={styles.outlinedInput}
                      placeholder=" "
                      value={form.deductionValue ?? ""}
                      onChange={handleChange}
                      type="number"
                      min="1"
                    />
                    <label className={styles.outlinedLabel}>Deduction Value</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <ErrorDisplay error={fieldErrors.deductionType} />
                  <div className={styles.inputGroup}>
                    <Select
                      options={deductionTypeOptions}
                      value={deductionTypeOptions.find(opt => opt.value === form.deductionType) || null}
                      onChange={option => handleChange({ target: { name: 'deductionType', value: option ? option.value : '' } })}
                      placeholder="Deduction Type"
                      styles={{
                        ...customSelectStyles,
                        menuPortal: base => ({ ...base, zIndex: 9999 })
                      }}
                      isClearable={false}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <VeryButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : (
                    "Add Employee"
                  )}
                </VeryButton>
                <VeryButton
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </VeryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
