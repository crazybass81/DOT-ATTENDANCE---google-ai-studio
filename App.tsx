
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './pages/AdminApp';
import WorkerApp from './pages/WorkerApp';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/worker/:storeId" element={<WorkerApp />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
