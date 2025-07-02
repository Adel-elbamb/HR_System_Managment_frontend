import React from 'react';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="container-fluid ps-0">
     
        <div className="col px-0">
          <Outlet />
        </div>
      </div>
   
  );
} 