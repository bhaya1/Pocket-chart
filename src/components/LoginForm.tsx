import React, { useState } from 'react';
import {
  CrossIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldCheckIcon } from
'lucide-react';
import { Role } from '../types';
interface LoginFormProps {
  onLogin: (email: string, role: Role) => Promise<void>;
}
export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(email, role);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
          <CrossIcon className="h-8 w-8 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">MedScribe AI</h1>
        <p className="text-slate-500 text-sm mt-1">
          Clinical Documentation Platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1.5"
            htmlFor="email">

            Email or Username
          </label>
          <input
            id="email"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            placeholder="dr.smith@hospital.org" />

        </div>

        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1.5"
            htmlFor="password">

            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="••••••••" />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">

              {showPassword ?
              <EyeOffIcon className="h-4 w-4" /> :

              <EyeIcon className="h-4 w-4" />
              }
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['Doctor', 'Administrator'] as Role[]).map((r) =>
            <label
              key={r}
              className={`flex items-center justify-center px-4 py-2.5 border rounded-lg cursor-pointer text-sm font-medium transition-all ${role === r ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>

                <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={(e) => setRole(e.target.value as Role)}
                className="sr-only" />

                {r}
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />

            <span className="text-sm text-slate-600">Remember me</span>
          </label>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-700">

            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2">

          {isLoading ?
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

          <>
              <LockIcon className="h-4 w-4" />
              Sign In
            </>
          }
        </button>
      </form>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
        <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
        <span>Secure HIPAA-compliant login</span>
      </div>
    </div>);

}