import { useState } from 'react';
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
  // Keep the signed-in user across page refreshes (demo only - no real backend)
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('medscribe_user');
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  });
  const setUser = (u: User | null) => {
    setUserState(u);
    try {
      if (u) sessionStorage.setItem('medscribe_user', JSON.stringify(u));
      else sessionStorage.removeItem('medscribe_user');
    } catch {
      /* storage unavailable - ignore */
    }
  };
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
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>);

}