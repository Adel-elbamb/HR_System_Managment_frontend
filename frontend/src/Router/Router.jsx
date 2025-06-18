import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
//Departments 
import ViewDepartments from '../pages/Department/ViewDepartments/ViewDepartment';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/dashboard', element: <Dashboard /> },
      // Departments
      { path: '/view', element: <ViewDepartments /> },


    ]
  }
]);

export default router; 