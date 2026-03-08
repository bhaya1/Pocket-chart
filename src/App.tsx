import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientChartPage } from './pages/PatientChartPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { FlaggedPage } from './pages/FlaggedPage';
import { SettingsPage } from './pages/SettingsPage';
import { User, Role } from './types';
export function App() {
  const [user, setUser] = useState<User | null>(null);
  const handleLogin = async (email: string, role: Role) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUser({
      id: 'u1',
      name: role === 'Doctor' ? 'Dr. Sarah Chen' : 'Admin User',
      email,
      role
    });
  };
  const handleLogout = () => {
    setUser(null);
  };
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route
          path="/login"
          element={
          user ?
          <Navigate to="/dashboard" replace /> :

          <LoginPage onLogin={handleLogin} />

          } />


        <Route
          element={<DashboardLayout user={user} onLogout={handleLogout} />}>

          <Route path="/dashboard" element={<DashboardPage user={user!} />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientChartPage />} />
          <Route path="/flagged" element={<FlaggedPage />} />
          <Route path="/activity" element={<ActivityLogPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Fallback routes for demo */}
          <Route
            path="/admin"
            element={
            <div className="p-8 text-center text-slate-500">
                System Administration (Coming Soon)
              </div>
            } />

        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>);

}