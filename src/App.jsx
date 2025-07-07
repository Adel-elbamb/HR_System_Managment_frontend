import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './Router/Router';
import Router from './Router/Router';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {


  return <RouterProvider router={Router} />;
}

export default App;