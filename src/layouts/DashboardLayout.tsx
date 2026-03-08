import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { User } from '../types';
interface DashboardLayoutProps {
  user: User | null;
  onLogout: () => void;
}
export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNav user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

}