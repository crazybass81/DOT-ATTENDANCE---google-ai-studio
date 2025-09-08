
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/Admin/AdminPage';
import WorkerRegistrationPage from './pages/Worker/WorkerRegistrationPage';
import WorkerDashboardPage from './pages/Worker/WorkerDashboardPage';
import { LoginPage } from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/worker/:storeId/register" element={<WorkerRegistrationPage />} />
        <Route path="/worker/:storeId/dashboard" element={<WorkerDashboardPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;