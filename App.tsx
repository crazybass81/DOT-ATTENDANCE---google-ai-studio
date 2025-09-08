


import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MOCK_EMPLOYEES_DATA, MOCK_ATTENDANCE } from './data/mockData';
import { Employee, AttendanceRecord } from './types';

// FIX: Corrected import path casing to match file system (Admin).
import AdminPage from './pages/Admin/AdminPage';
// FIX: Corrected import path casing to match file system (Worker).
import WorkerRegistrationPage from './pages/Worker/WorkerRegistrationPage';
// FIX: Corrected import path casing to match file system (Worker).
import WorkerDashboardPage from './pages/Worker/WorkerDashboardPage';
// FIX: Corrected import path casing to match file system (Auth).
import { LoginPage } from './pages/Auth/LoginPage';
// FIX: Corrected import path casing to match file system (Auth).
import RegisterPage from './pages/Auth/RegisterPage';
import WorkerApp from './pages/WorkerApp';

function App() {
  const [employees, setEmployees] = useState<(Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[]>(MOCK_EMPLOYEES_DATA);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/admin" 
          element={<AdminPage 
            employees={employees} 
            setEmployees={setEmployees} 
            attendance={attendance} 
            setAttendance={setAttendance} 
          />} 
        />
        <Route path="/worker/:storeId" element={<WorkerApp />} />
        <Route path="/worker/:storeId/register" element={<WorkerRegistrationPage />} />
        <Route 
          path="/worker/:storeId/dashboard" 
          element={<WorkerDashboardPage 
            allEmployees={employees} 
            allAttendance={attendance} 
            setAttendance={setAttendance} 
          />} 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;