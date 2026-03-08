import React from 'react';
import { motion } from 'framer-motion';
import {
  FileTextIcon,
  ActivityIcon,
  MicroscopeIcon,
  ImageIcon,
  SparklesIcon,
  ClockIcon } from
'lucide-react';
import { mockActivities, mockPatients, mockDoctors } from '../data/mockData';
import { ActivityType } from '../types';
export function ActivityLogPage() {
  const getIconForType = (type: ActivityType) => {
    switch (type) {
      case 'chart_created':
        return <FileTextIcon className="h-5 w-5 text-blue-600" />;
      case 'field_updated':
        return <ActivityIcon className="h-5 w-5 text-emerald-600" />;
      case 'lab_uploaded':
        return <MicroscopeIcon className="h-5 w-5 text-purple-600" />;
      case 'imaging_uploaded':
        return <ImageIcon className="h-5 w-5 text-amber-600" />;
      case 'ai_correction':
        return <SparklesIcon className="h-5 w-5 text-indigo-600" />;
    }
  };
  const getBgForType = (type: ActivityType) => {
    switch (type) {
      case 'chart_created':
        return 'bg-blue-100 ring-blue-50';
      case 'field_updated':
        return 'bg-emerald-100 ring-emerald-50';
      case 'lab_uploaded':
        return 'bg-purple-100 ring-purple-50';
      case 'imaging_uploaded':
        return 'bg-amber-100 ring-amber-50';
      case 'ai_correction':
        return 'bg-indigo-100 ring-indigo-50';
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          System Activity Logs
        </h1>
        <p className="text-slate-500 mt-1">
          Audit trail of all actions within the platform.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 py-4">
          {mockActivities.map((activity, index) => {
            const patient = mockPatients.find(
              (p) => p.id === activity.patientId
            );
            const doctor = mockDoctors.find((d) => d.id === activity.userId);
            const userDisplay = doctor ? doctor.name : 'System';
            return (
              <motion.div
                key={activity.id}
                initial={{
                  opacity: 0,
                  x: -20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  delay: index * 0.1
                }}
                className="relative pl-8">

                {/* Timeline dot */}
                <div
                  className={`absolute -left-[21px] top-1 h-10 w-10 rounded-full flex items-center justify-center ring-8 ${getBgForType(activity.type)}`}>

                  {getIconForType(activity.type)}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {activity.description}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 w-fit">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-900">User:</span>{' '}
                      {userDisplay}
                    </div>
                    {patient &&
                    <>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-900">
                            Patient:
                          </span>{' '}
                          {patient.name} ({patient.id})
                        </div>
                      </>
                    }
                  </div>
                </div>
              </motion.div>);

          })}
        </div>
      </div>
    </div>);

}