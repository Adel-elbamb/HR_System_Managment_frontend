import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
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
        path: '/',
        element: <MainLayout />,
        children: [
          { path: '/', element: <Dashboard /> },
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/departments', element: <Department /> },
          { path: '/payroll', element: <Payroll /> },
        ]
      }
    ]
  }
]);

export default router; 