import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="container-fluid ps-0 pe-0">
      <Header />
      <div className="row w-100">
        <div className="col-auto">
          <Sidebar />
        </div>
        <div className="col px-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 