import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById, updateEmployee, getAllDepartments } from "../../services/employee.services";
import styles from "./EditEmployee.module.css";
import Select from 'react-select';
import ErrorDisplay from '../../components/common/ErrorDisplay';

function filterEditableFields(data) {
  const allowed = [
    "firstName", "lastName", "email", "phone", "salary", "address",
    "defaultCheckInTime", "defaultCheckOutTime", "gender", "nationality",
    "nationalId", "birthdate", "department", "weekendDays",
    "overtimeValue", "overtimeType", "deductionValue", "deductionType"
  ];
  const filtered = {};
  allowed.forEach(key => {
    if (data[key] !== undefined) filtered[key] = data[key];
  });
  return filtered;
}

function getHourDecimal(timeStr) {
  if (!timeStr) return 0;
  const [h, m = 0, s = 0] = timeStr.split(':').map(Number);
  return h + m / 60 + s / 3600;
}

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const empRes = await getEmployeeById(id);
        setForm(empRes.data ? empRes.data[0] : null);
        const deptRes = await getAllDepartments();
        setDepartments(deptRes.data || []);
      } catch {
        setError("Failed to fetch employee or departments");
      } finally {
        setLoading(false);
        setDepartmentsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const errors = {};

    // Validate salary, overtimeValue, deductionValue > 0
    if (form.salary !== undefined && form.salary !== "" && Number(form.salary) <= 0) {
      errors.salary = "Salary must be greater than zero.";
    }
    if (form.overtimeValue !== undefined && form.overtimeValue !== "" && Number(form.overtimeValue) <= 0) {
      errors.overtimeValue = "Overtime value must be greater than zero.";
    }
    if (form.deductionValue !== undefined && form.deductionValue !== "" && Number(form.deductionValue) <= 0) {
      errors.deductionValue = "Deduction value must be greater than zero.";
    }

    // Validate birthdate: at least 16 years before today
    if (form.birthdate) {
      const selectedDate = new Date(form.birthdate);
      const today = new Date();
      if (selectedDate > today) {
        errors.birthdate = "Birthdate cannot be in the future.";
      } else {
        const minBirthdate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        if (selectedDate > minBirthdate) {
          errors.birthdate = "Employee must be at least 16 years old.";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const submitData = {
      ...form,
      weekendDays: form.weekendDays && Array.isArray(form.weekendDays)
        ? form.weekendDays
        : (form.weekendDays ? form.weekendDays.split(",").map(day => day.trim()).filter(Boolean) : []),
      defaultCheckInTime: getHourDecimal(form.defaultCheckInTime),
      defaultCheckOutTime: getHourDecimal(form.defaultCheckOutTime),
    };
    // Filter out unwanted fields
    const filteredData = filterEditableFields(submitData);
    // Ensure required fields are present
    if (!filteredData.overtimeType) filteredData.overtimeType = "";
    if (!filteredData.deductionType) filteredData.deductionType = "";
    // Ensure department is a string (id) and handle type errors
    if (filteredData.department && typeof filteredData.department !== 'string') {
      if (filteredData.department._id) {
        filteredData.department = filteredData.department._id;
      } else if (typeof filteredData.department === 'object') {
        // fallback: try to get first string property
        const strVal = Object.values(filteredData.department).find(v => typeof v === 'string');
        if (strVal) filteredData.department = strVal;
      }
    }
    try {
      await updateEmployee(id, filteredData);
      navigate("/employees");
    } catch (err) {
      const backendErrors = err.response?.data;
      console.log('BACKEND ERRORS:', backendErrors); // DEBUG
      let errorsObj = {};
      setError("");

      // If backendErrors.message is a stringified array, parse it
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

                if (field === "phone" && (errorType === "string.pattern.base" || message.includes("fails to match"))) {
                  errorsObj[field] = "Phone number must be exactly 11 digits.";
                } else if (message.includes("not allowed to be empty")) {
                  errorsObj[field] = "This field is required.";
                } else {
                  errorsObj[field] = message;
                }
              }
            });
          }
          setFieldErrors(errorsObj);
          return;
        } catch (e) {
          // fallback to generic error
        }
      }

      // fallback: handle as before
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach(error => {
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
                errorsObj[field] = `${fieldDisplayName} must be exactly 11 digits.`;
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
        setFieldErrors(errorsObj);
      } else if (typeof backendErrors === 'object' && backendErrors !== null) {
        Object.keys(backendErrors).forEach(field => {
          errorsObj[field] = backendErrors[field];
        });
          setFieldErrors(errorsObj);
      } else if (typeof backendErrors === 'string') {
        setError(backendErrors);
        setFieldErrors({});
      } else {
        setError("Failed to update employee. Please check your input.");
        setFieldErrors({});
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !form) return <div className={styles.loading}>Loading...</div>;

  // Gender, overtimeType, deductionType options
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
    <div className={`container-fluid ${styles.container}`}>
      <div className="row justify-content-center">
        <div className={`col-12 col-md-10 col-lg-8 ${styles.card}`}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>Edit Employee</div>
            <div className={styles.headerSubtitle}>Update employee details and save changes.</div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <form className={`${styles.form} row g-3`} onSubmit={handleSubmit}>
            <div className="row">
              {/* First Name */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.firstName} />
                <input
                  name="firstName"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.firstName || ""}
                  onChange={handleChange}
                  required
                />
                <label className={styles.outlinedLabel}>First Name</label>
              </div>
              {/* Last Name */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.lastName} />
                <input
                  name="lastName"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.lastName || ""}
                  onChange={handleChange}
                  required
                />
                <label className={styles.outlinedLabel}>Last Name</label>
              </div>
              {/* Email */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.email} />
                <input
                  name="email"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.email || ""}
                  onChange={handleChange}
                  required
                  type="email"
                />
                <label className={styles.outlinedLabel}>Email</label>
              </div>
              {/* Phone */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.phone} />
                <input
                  name="phone"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.phone || ""}
                  onChange={handleChange}
                  required
                  maxLength="11"
                  pattern="[0-9]{11}"
                />
                <label className={styles.outlinedLabel}>Phone Number (11 digits)</label>
              </div>
              {/* Salary */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.salary} />
                <input
                  name="salary"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.salary || ""}
                  onChange={handleChange}
                  required
                  type="number"
                />
                <label className={styles.outlinedLabel}>Salary</label>
              </div>
              {/* Address */}
              <div className={`col-12 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.address} />
                <input
                  name="address"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.address || ""}
                  onChange={handleChange}
                  required
                />
                <label className={styles.outlinedLabel}>Address</label>
              </div>
              {/* Check-In Time */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.defaultCheckInTime} />
                <input
                  name="defaultCheckInTime"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.defaultCheckInTime || ""}
                  onChange={handleChange}
                  type="time"
                />
                <label className={styles.outlinedLabel}>Check-In Time</label>
              </div>
              {/* Check-Out Time */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.defaultCheckOutTime} />
                <input
                  name="defaultCheckOutTime"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.defaultCheckOutTime || ""}
                  onChange={handleChange}
                  type="time"
                />
                <label className={styles.outlinedLabel}>Check-Out Time</label>
              </div>
              {/* Gender (Select) */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.gender} />
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
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              </div>
              {/* Nationality */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.nationality} />
                <input
                  name="nationality"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.nationality || ""}
                  onChange={handleChange}
                  required
                />
                <label className={styles.outlinedLabel}>Nationality</label>
              </div>
              {/* National ID */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.nationalId} />
                <input
                  name="nationalId"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.nationalId || ""}
                  onChange={handleChange}
                  required
                />
                <label className={styles.outlinedLabel}>National ID</label>
              </div>
              {/* Birthdate */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.birthdate} />
                <input
                  id="birthdate"
                  name="birthdate"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.birthdate || ""}
                  onChange={handleChange}
                  required
                  type="text"
                  pattern="\d{4}-\d{2}-\d{2}"
                  onFocus={e => e.target.type = "date"}
                  onBlur={e => { if (!e.target.value) { e.target.type = "text"; } }}
                />
                <label className={styles.outlinedLabel}>Birthdate</label>
              </div>
              {/* Department (Select) */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.department} />
                <Select
                  options={departmentOptions}
                  value={departmentOptions.find(opt => opt.value === (form.department?._id || form.department)) || null}
                  onChange={option => handleChange({ target: { name: 'department', value: option ? option.value : '' } })}
                  placeholder={departmentsLoading ? 'Loading departments...' : 'Department'}
                  styles={{
                    ...customSelectStyles,
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                  }}
                  isClearable={false}
                  isDisabled={departmentsLoading}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              </div>
              {/* Weekend Days */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.weekendDays} />
                <input
                  name="weekendDays"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={Array.isArray(form.weekendDays) ? form.weekendDays.join(",") : (form.weekendDays || "")}
                  onChange={handleChange}
                />
                <label className={styles.outlinedLabel}>Weekend Days (comma separated)</label>
              </div>
              {/* Overtime Value */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.overtimeValue} />
                <input
                  name="overtimeValue"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.overtimeValue || ""}
                  onChange={handleChange}
                />
                <label className={styles.outlinedLabel}>Overtime Value</label>
              </div>
              {/* Overtime Type (Select) */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.overtimeType} />
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
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              </div>
              {/* Deduction Value */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.deductionValue} />
                <input
                  name="deductionValue"
                  className={styles.outlinedInput}
                  placeholder=" "
                  value={form.deductionValue || ""}
                  onChange={handleChange}
                />
                <label className={styles.outlinedLabel}>Deduction Value</label>
              </div>
              {/* Deduction Type (Select) */}
              <div className={`col-12 col-md-6 ${styles.inputGroup}`}>
                <ErrorDisplay error={fieldErrors.deductionType} />
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
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              </div>
            </div>
            <div className={`${styles.actions} d-flex flex-wrap gap-2 mt-3`}>
              <button type="submit" className={styles.updateBtn} disabled={loading}>
                {loading ? "Updating..." : "Update"}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate("/employees")}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
};

export default EditEmployee;
