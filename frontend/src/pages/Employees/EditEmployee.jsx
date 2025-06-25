import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById, updateEmployee, getAllDepartments } from "../../services/employee.services";

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
    const submitData = {
      ...form,
      weekendDays: form.weekendDays && Array.isArray(form.weekendDays)
        ? form.weekendDays
        : (form.weekendDays ? form.weekendDays.split(",").map(day => day.trim()).filter(Boolean) : []),
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

  if (loading || !form) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow-sm p-4">
        <h3 className="card-title mb-4">Edit Employee</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              {fieldErrors.firstName && <small className="text-danger">{fieldErrors.firstName}</small>}
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.lastName && <small className="text-danger">{fieldErrors.lastName}</small>}
              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.lastName ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-12">
              {fieldErrors.email && <small className="text-danger">{fieldErrors.email}</small>}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-12">
              {fieldErrors.phone && <small className="text-danger">{fieldErrors.phone}</small>}
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-12">
              {fieldErrors.salary && <small className="text-danger">{fieldErrors.salary}</small>}
              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={form.salary || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.salary ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-12">
              {fieldErrors.address && <small className="text-danger">{fieldErrors.address}</small>}
              <input
                name="address"
                placeholder="Address"
                value={form.address || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.address ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.defaultCheckInTime && <small className="text-danger">{fieldErrors.defaultCheckInTime}</small>}
              <input
                name="defaultCheckInTime"
                placeholder="Check-In Time"
                value={form.defaultCheckInTime || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.defaultCheckInTime ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.defaultCheckOutTime && <small className="text-danger">{fieldErrors.defaultCheckOutTime}</small>}
              <input
                name="defaultCheckOutTime"
                placeholder="Check-Out Time"
                value={form.defaultCheckOutTime || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.defaultCheckOutTime ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.gender && <small className="text-danger">{fieldErrors.gender}</small>}
              <input
                name="gender"
                placeholder="Gender"
                value={form.gender || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.gender ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.nationality && <small className="text-danger">{fieldErrors.nationality}</small>}
              <input
                name="nationality"
                placeholder="Nationality"
                value={form.nationality || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.nationality ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-12">
              {fieldErrors.nationalId && <small className="text-danger">{fieldErrors.nationalId}</small>}
              <input
                name="nationalId"
                placeholder="National ID"
                value={form.nationalId || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.nationalId ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-12">
              {fieldErrors.birthdate && <small className="text-danger">{fieldErrors.birthdate}</small>}
              <input
                type="date"
                name="birthdate"
                value={form.birthdate || ""}
                onChange={handleChange}
                required
                className={`form-control ${fieldErrors.birthdate ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-12">
              {fieldErrors.department && <small className="text-danger">{fieldErrors.department}</small>}
              <select
                name="department"
                value={form.department?._id || form.department || ""}
                onChange={handleChange}
                required
                disabled={departmentsLoading}
                className={`form-select ${fieldErrors.department ? 'is-invalid' : ''}`}
              >
                <option value="">{departmentsLoading ? "Loading departments..." : "Select Department"}</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              {fieldErrors.weekendDays && <small className="text-danger">{fieldErrors.weekendDays}</small>}
              <input
                name="weekendDays"
                placeholder="Weekend Days (comma separated)"
                value={Array.isArray(form.weekendDays) ? form.weekendDays.join(",") : (form.weekendDays || "")}
                onChange={handleChange}
                className={`form-control ${fieldErrors.weekendDays ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.overtimeValue && <small className="text-danger">{fieldErrors.overtimeValue}</small>}
              <input
                name="overtimeValue"
                placeholder="Overtime Value"
                value={form.overtimeValue || ""}
                onChange={handleChange}
                className={`form-control ${fieldErrors.overtimeValue ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.overtimeType && <small className="text-danger">{fieldErrors.overtimeType}</small>}
              <select
                name="overtimeType"
                value={form.overtimeType || ""}
                onChange={handleChange}
                required
                className={`form-select ${fieldErrors.overtimeType ? 'is-invalid' : ''}`}
              >
                <option value="">Select Overtime Type</option>
                <option value="hr">hr</option>
                <option value="pound">pound</option>
              </select>
            </div>
            <div className="col-md-6">
              {fieldErrors.deductionValue && <small className="text-danger">{fieldErrors.deductionValue}</small>}
              <input
                name="deductionValue"
                placeholder="Deduction Value"
                value={form.deductionValue || ""}
                onChange={handleChange}
                className={`form-control ${fieldErrors.deductionValue ? 'is-invalid' : ''}`}
              />
            </div>
            <div className="col-md-6">
              {fieldErrors.deductionType && <small className="text-danger">{fieldErrors.deductionType}</small>}
              <select
                name="deductionType"
                value={form.deductionType || ""}
                onChange={handleChange}
                required
                className={`form-select ${fieldErrors.deductionType ? 'is-invalid' : ''}`}
              >
                <option value="">Select Deduction Type</option>
                <option value="hr">Hour</option>
                <option value="pound">Pound</option>
              </select>
            </div>
          </div>
  
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="submit" className="btn btn-outline-primary text-dark" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
            <button type="button" className="btn btn-outline-secondary text-dark" onClick={() => navigate("/employees")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default EditEmployee;
