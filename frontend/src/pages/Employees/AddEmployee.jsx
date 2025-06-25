import React, { useState, useEffect } from "react";
import { addEmployee, getAllDepartments } from "../../services/employee.services";
import { useNavigate } from "react-router-dom";
import { handleBackendValidationErrors, handleGeneralBackendError } from "../../utils/errorHandler";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import "bootstrap/dist/css/bootstrap.min.css";

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
    
    // Phone number validation
    if (form.phone && form.phone.length !== 11) {
      errors.phone = "Phone number must be exactly 11 digits.";
    }
    
    // Birthdate validation
    if (form.birthdate) {
      const selectedDate = new Date(form.birthdate);
      const today = new Date();
      if (selectedDate > today) {
        errors.birthdate = "Birthdate cannot be in the future.";
      }
    }
    
    if (form.overtimeValue === null || form.overtimeValue === "") {
      errors.overtimeValue = "Overtime value is required and must be a number.";
    }
    if (form.deductionValue === null || form.deductionValue === "") {
      errors.deductionValue = "Deduction value is required and must be a number.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    const submitData = {
      ...form,
      weekendDays: form.weekendDays ? form.weekendDays.split(",").map(day => day.trim()).filter(Boolean) : [],
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
          // fallback to generic error
        }
      }

      // fallback: handle as before
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

  return (
    <div className="container py-4">
      <div className="card shadow border-0 rounded-3">
        <div className="card-header text-center bg-secondary-subtle text-white d-flex align-items-center ">
          <h3 className="mb-0 h4 text-center text-dark">Add Employee</h3>
        </div>
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
                <input
                  name="firstName"
                  className="form-control"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.lastName} />
                <input
                  name="lastName"
                  className="form-control"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.email} />
              <input
                name="email"
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                type="email"
              />
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.phone} />
              <input
                name="phone"
                className="form-control"
                placeholder="Phone Number (11 digits)"
                value={form.phone}
                onChange={handleChange}
                required
                maxLength="11"
                pattern="[0-9]{11}"
              />
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.salary} />
              <input
                name="salary"
                className="form-control"
                placeholder="Salary"
                value={form.salary}
                onChange={handleChange}
                required
                type="number"
              />
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.address} />
              <input
                name="address"
                className="form-control"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.defaultCheckInTime} />
                <input
                  name="defaultCheckInTime"
                  className="form-control"
                  placeholder="Check-In Time (HH:MM:SS)"
                  value={form.defaultCheckInTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.defaultCheckOutTime} />
                <input
                  name="defaultCheckOutTime"
                  className="form-control"
                  placeholder="Check-Out Time (HH:MM:SS)"
                  value={form.defaultCheckOutTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.gender} />
                <select
                  name="gender"
                  className="form-select"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.nationality} />
                <input
                  name="nationality"
                  className="form-control"
                  placeholder="Nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.nationalId} />
              <input
                name="nationalId"
                className="form-control"
                placeholder="National ID"
                value={form.nationalId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.birthdate} />
            
              <input
                id="birthdate"
                name="birthdate"
                className="form-control"
                placeholder="Birthdate"
                value={form.birthdate}
                onChange={handleChange}
                required
                type="text"
                pattern="\d{4}-\d{2}-\d{2}"
                onFocus={(e) => e.target.type = "date"}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = "text";
                  }
                }}
              />
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.department} />
              <select
                name="department"
                className="form-select"
                value={form.department}
                onChange={handleChange}
                required
                disabled={departmentsLoading}
              >
                <option value="">{departmentsLoading ? "Loading departments..." : "Select Department"}</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <ErrorDisplay error={fieldErrors.weekendDays} />
              <input
                name="weekendDays"
                className="form-control"
                placeholder="Weekend Days (comma separated)"
                value={form.weekendDays}
                onChange={handleChange}
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.overtimeValue} />
                <input
                  name="overtimeValue"
                  className="form-control"
                  placeholder="Overtime Value"
                  value={form.overtimeValue ?? ""}
                  onChange={handleChange}
                  type="number"
                  required
                />
              </div>
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.overtimeType} />
                <select
                  name="overtimeType"
                  className="form-select"
                  value={form.overtimeType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Overtime Type</option>
                  <option value="hr">hr</option>
                  <option value="pound">pound</option>
                </select>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.deductionValue} />
                <input
                  name="deductionValue"
                  className="form-control"
                  placeholder="Deduction Value"
                  value={form.deductionValue ?? ""}
                  onChange={handleChange}
                  type="number"
                  required
                />
              </div>
              <div className="col-md-6">
                <ErrorDisplay error={fieldErrors.deductionType} />
                <select
                  name="deductionType"
                  className="form-select"
                  value={form.deductionType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Deduction Type</option>
                  <option value="hr">Hour</option>
                  <option value="pound">Pound</option>
                </select>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-outline-primary text-dark"
                disabled={loading}
                style={{ transition: "transform 0.2s" }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Adding...
                  </>
                ) : (
                  "Add Employee"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary text-dark"
                onClick={handleCancel}
                style={{ transition: "transform 0.2s" }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
