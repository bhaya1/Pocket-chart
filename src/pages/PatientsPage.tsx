import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FilterIcon,
  ArrowUpDownIcon,
  SearchIcon,
  FolderOpenIcon,
  CopyIcon,
  FolderInputIcon,
  ArchiveIcon,
  Trash2Icon,
  CheckIcon } from
'lucide-react';
import { mockPatients, mockNotifications } from '../data/mockData';
import { Patient } from '../types';
export function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const statusFilter = searchParams.get('status') || 'All';
  const sortOption = searchParams.get('sort') || 'Date Registered (Newest)';
  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Review Needed':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Archived':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };
  const getUnreadNotificationCount = (patientId: string) => {
    return mockNotifications.filter(
      (n) => n.patientId === patientId && !n.isRead
    ).length;
  };
  // Filter and Sort Logic
  let processedPatients = [...mockPatients];
  if (searchTerm) {
    processedPatients = processedPatients.filter(
      (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (statusFilter !== 'All') {
    processedPatients = processedPatients.filter(
      (p) => p.status === statusFilter
    );
  }
  processedPatients.sort((a, b) => {
    switch (sortOption) {
      case 'Date Registered (Newest)':
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

      case 'Date Registered (Oldest)':
        return (
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());

      case 'Name (A-Z)':
        return a.name.localeCompare(b.name);
      case 'Name (Z-A)':
        return b.name.localeCompare(a.name);
      case 'Patient ID (Ascending)':
        return a.id.localeCompare(b.id);
      case 'Patient ID (Descending)':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });
  const handleSortChange = (option: string) => {
    searchParams.set('sort', option);
    setSearchParams(searchParams);
    setShowSortDropdown(false);
  };
  const handleFilterChange = (status: string) => {
    if (status === 'All') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
    setShowFilterDropdown(false);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Charts</h1>
          <p className="text-slate-500 mt-1">
            Manage and review structured electronic health records.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />

        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">

              <FilterIcon className="h-4 w-4" />
              Filter{' '}
              {statusFilter !== 'All' &&
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {statusFilter}
                </span>
              }
            </button>
            <AnimatePresence>
              {showFilterDropdown &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: 10
                }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-20">

                  <div className="py-1">
                    {['All', 'Active', 'Review Needed', 'Archived'].map(
                    (status) =>
                    <button
                      key={status}
                      onClick={() => handleFilterChange(status)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between">

                          {status}
                          {statusFilter === status &&
                      <CheckIcon className="h-4 w-4 text-blue-600" />
                      }
                        </button>

                  )}
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">

              <ArrowUpDownIcon className="h-4 w-4" />
              Sort
            </button>
            <AnimatePresence>
              {showSortDropdown &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: 10
                }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-20">

                  <div className="py-1">
                    {[
                  'Date Registered (Newest)',
                  'Date Registered (Oldest)',
                  'Name (A-Z)',
                  'Name (Z-A)',
                  'Patient ID (Ascending)',
                  'Patient ID (Descending)'].
                  map((option) =>
                  <button
                    key={option}
                    onClick={() => handleSortChange(option)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between">

                        {option}
                        {sortOption === option &&
                    <CheckIcon className="h-4 w-4 text-blue-600" />
                    }
                      </button>
                  )}
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processedPatients.map((patient, index) => {
                const unreadCount = getUnreadNotificationCount(patient.id);
                return (
                  <motion.tr
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: index * 0.05
                    }}
                    key={patient.id}
                    className="hover:bg-slate-50 transition-colors group">

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                          {patient.name.
                          split(' ').
                          map((n) => n[0]).
                          join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/patients/${patient.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600 transition-colors cursor-pointer block">

                              {patient.name}
                            </Link>
                            {unreadCount > 0 &&
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {unreadCount}
                              </span>
                            }
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {patient.age} yrs • {patient.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">

                        {patient.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(patient.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>

                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Open Chart">

                          <FolderOpenIcon className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Copy Chart">

                          <CopyIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Move Chart">

                          <FolderInputIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Archive">

                          <ArchiveIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete">

                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>);

              })}
            </tbody>
          </table>
          {processedPatients.length === 0 &&
          <div className="p-8 text-center text-slate-500">
              No patients found matching your search or filters.
            </div>
          }
        </div>
      </div>
    </div>);

}