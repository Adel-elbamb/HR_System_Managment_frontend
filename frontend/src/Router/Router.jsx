import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Attendence from '../pages/Attendence/Attendence';
import AddAttendence from '../pages/Attendence/AddAttendence';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
     
      {path:'attendence',element:<Attendence/>},
      {path:'addattendence',element:<AddAttendence/>}
      

      
    ]
  }
]);

export default router; 