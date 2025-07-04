import axios from "axios";
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

// Get all employees (with optional query params)
export const getAllEmployees = async (params = {}) => {
  const requestParams = {
    limit: 1000, 
    skip: 0,     
    ...params    
  };
  const res = await api.get("/employee", { params: requestParams });

  return res.data;
  
};


// Get total count of employees
export const getEmployeeCount = async () => {
  const res = await api.get("/employee/count");
  return res.data;
};

// Add a new employee
export const addEmployee = async (employeeData) => {
  const res = await api.post("/employee", employeeData);
  return res.data;
};

// Update an employee by ID
export const updateEmployee = async (id, employeeData) => {
  const res = await api.put(`/employee/${id}`, employeeData);
  return res.data;
};

// Delete (soft delete) an employee by ID
export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employee/${id}`);
  return res.data;
};

// Get a single employee by ID
export const getEmployeeById = async (id) => {
  const res = await api.get(`/employee/${id}`);
  return res.data;
};

// Restore a deleted employee by ID
export const restoreEmployee = async (id) => {
  const res = await api.patch(`/employee/restore/${id}`);
  return res.data;
};

// Get all deleted employees (with optional query params)
export const getDeletedEmployees = async (params = {}) => {
  const res = await api.get("/employee/deleted", { params });
  return res.data;
};

// Get all departments
export const getAllDepartments = async () => {
  const res = await api.get("/department");
  return res.data;
};
