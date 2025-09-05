
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AdminApp from './pages/AdminApp';
import WorkerRegistrationPage from './pages/WorkerRegistrationPage';
import WorkerDashboard from './pages/WorkerDashboard';
import { LoginPage } from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/worker/:storeId/register" element={<WorkerRegistrationPage />} />
        <Route path="/worker/:storeId/dashboard" element={<WorkerDashboard />} />
      </Routes>
    </HashRouter>
  );
}

export default App;