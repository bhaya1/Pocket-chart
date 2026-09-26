import { NavLink } from 'react-router-dom';
import {
  ActivityIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldAlertIcon,
  UsersIcon,
  CrossIcon,
  FlagIcon } from
'lucide-react';
import { User } from '../types';
interface SidebarProps {
  user: User;
  onLogout: () => void;
}
export function Sidebar({ user, onLogout }: SidebarProps) {
  const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboardIcon
  },
  {
    name: 'Patient Charts',
    path: '/patients',
    icon: UsersIcon
  },
  {
    name: 'View Flagged',
    path: '/flagged',
    icon: FlagIcon
  },
  {
    name: 'Activity Logs',
    path: '/activity',
    icon: ActivityIcon
  }];

  const adminItems = [
  {
    name: 'System Admin',
    path: '/admin',
    icon: ShieldAlertIcon
  }];

  const bottomItems = [
  {
    name: 'Settings',
    path: '/settings',
    icon: SettingsIcon
  }];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-20">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600">
          <CrossIcon className="h-6 w-6 fill-current" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            MedScribe AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
          Main Menu
        </div>
        {navItems.map((item) =>
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
          }>

            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        )}

        {user.role === 'Administrator' &&
        <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">
              Administration
            </div>
            {adminItems.map((item) =>
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
            }>

                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
          )}
          </>
        }
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-200 flex flex-col gap-1">
        {bottomItems.map((item) =>
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
          }>

            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left">

          <LogOutIcon className="h-5 w-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>);

}