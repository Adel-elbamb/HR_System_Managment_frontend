// Router/Router.jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Employees from '../pages/Employees/Employees';
import AddEmployee from '../pages/Employees/AddEmployee';
import DeletedEmployee from '../pages/Employees/DeletedEmployee';
import EditEmployee from '../pages/Employees/EditEmployee';
import EmployeeDetails from '../pages/Employees/ViewEmployee';
import Login from '../pages/Login/Login';
import ProtectedRoute from './ProtectedRoute';
import Department from '../pages/Department/ViewDepartments/ViewDepartment';
import Payroll from '../pages/Payroll/Payroll';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/employees', element: <Employees /> },
          { path: '/add-employee', element: <AddEmployee /> },
          { path: '/deleted-employees', element: <DeletedEmployee /> },
          { path: '/edit-employee/:id', element: <EditEmployee /> },
          { path: '/employee/:id', element: <EmployeeDetails /> },
          { path: '/departments', element: <Department /> },
          { path: '/payroll', element: <Payroll /> },
          {path:'attendence',element:<Attendence/>},
          {path:'addattendence',element:<AddAttendence/>},
        ],
      },
    ],
  },
]);

export default router;
