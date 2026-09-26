import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  FileTextIcon,
  AlertCircleIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  CalendarIcon,
  MegaphoneIcon } from
'lucide-react';
import { User } from '../types';
import { mockSchedule, mockAnnouncements } from '../data/mockData';
import { toast } from 'sonner';
interface DashboardPageProps {
  user: User;
}
export function DashboardPage({ user }: DashboardPageProps) {
  const navigate = useNavigate();
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  useEffect(() => {
    // Find next appointment for reminder
    const today = 1; // Mocking Monday
    const upcomingApt = mockSchedule.find((s) => s.dayOfWeek === today);
    if (upcomingApt) {
      toast('Upcoming Appointment', {
        description: `${upcomingApt.patientName} - ${upcomingApt.type} at ${upcomingApt.startTime}`,
        action: {
          label: 'View Profile',
          onClick: () => navigate(`/patients/${upcomingApt.patientId}`)
        },
        duration: 8000
      });
    }
  }, [navigate]);
  const stats = [
  {
    label: 'Total Patients',
    value: '1,248',
    trend: '+12%',
    isPositive: true,
    icon: UsersIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    link: '/patients'
  },
  {
    label: 'Active Charts',
    value: '342',
    trend: '+5%',
    isPositive: true,
    icon: FileTextIcon,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    link: '/patients?status=Active'
  },
  {
    label: 'Pending Reviews',
    value: '28',
    trend: '-2%',
    isPositive: true,
    icon: AlertCircleIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    link: '/flagged'
  }];

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consultation':
        return 'bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200';
      case 'Follow-up':
        return 'bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200';
      case 'Lab Review':
        return 'bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200';
      case 'Procedure':
        return 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200';
    }
  };
  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'patient':
        return 'bg-blue-500';
      case 'system':
        return 'bg-amber-500';
      case 'ai':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  const currentDay = 1; // Mocking Monday as current day
  const displayedAnnouncements = showAllAnnouncements ?
  mockAnnouncements :
  mockAnnouncements.slice(0, 3);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening with your patients today.
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {stats.map((stat) =>
        <Link key={stat.label} to={stat.link}>
            <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all">

              <div className="flex items-center justify-between mb-4">
                <div
                className={`h-12 w-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>

                  <stat.icon className="h-6 w-6" />
                </div>
                <div
                className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>

                  {stat.trend}
                  {stat.isPositive ?
                <ArrowUpRightIcon className="h-4 w-4" /> :

                <ArrowDownRightIcon className="h-4 w-4" />
                }
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </motion.div>
          </Link>
        )}
      </motion.div>

      {/* Announcements Block */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.3
        }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
          <MegaphoneIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Updates
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {displayedAnnouncements.map((announcement) =>
          <div
            key={announcement.id}
            className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">

              <div
              className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getAnnouncementColor(announcement.type)}`}>
            </div>
              <div className="flex-1">
                <p className="text-sm text-slate-900 font-medium">
                  {announcement.message}
                </p>
              </div>
              <div className="text-xs text-slate-500 whitespace-nowrap">
                {formatTimeAgo(announcement.timestamp)}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
          className="w-full py-3 border-t border-slate-100 text-sm text-blue-600 font-medium hover:bg-slate-50 transition-colors">

          {showAllAnnouncements ? 'View Less' : 'View More'}
        </button>
      </motion.div>

      {/* Weekly Schedule */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.4
        }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Weekly Schedule
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              Consultation
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              Follow-up
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>Lab
              Review
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>Procedure
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Grid Header */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
              <div className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                Time
              </div>
              {daysOfWeek.map((day, index) =>
              <div
                key={day}
                className={`p-4 text-center text-sm font-semibold border-r border-slate-200 last:border-r-0 ${index + 1 === currentDay ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}>

                  {day}
                </div>
              )}
            </div>

            {/* Grid Body */}
            <div className="relative">
              {timeSlots.map((time) =>
              <div
                key={time}
                className="grid grid-cols-8 border-b border-slate-100 last:border-b-0">

                  <div className="p-3 text-center text-xs font-medium text-slate-400 border-r border-slate-200 bg-slate-50/30">
                    {time}
                  </div>
                  {daysOfWeek.map((_, dayIndex) => {
                  const dayNum = dayIndex + 1;
                  const appointments = mockSchedule.filter(
                    (s) =>
                    s.dayOfWeek === dayNum &&
                    s.startTime.startsWith(time.split(':')[0])
                  );
                  return (
                    <div
                      key={`${dayNum}-${time}`}
                      className={`p-1 border-r border-slate-100 last:border-r-0 min-h-[80px] ${dayNum === currentDay ? 'bg-blue-50/10' : ''}`}>

                        {appointments.map((apt) =>
                      <Link
                        key={apt.id}
                        to={`/patients/${apt.patientId}`}
                        className="block">

                            <div
                          className={`p-2 mb-1 rounded border text-xs cursor-pointer transition-colors ${getTypeColor(apt.type)}`}>

                              <div className="font-semibold truncate">
                                {apt.patientName}
                              </div>
                              <div className="opacity-80 mt-0.5">
                                {apt.startTime} - {apt.endTime}
                              </div>
                              <div className="opacity-80 truncate">
                                {apt.type}
                              </div>
                            </div>
                          </Link>
                      )}
                      </div>);

                })}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>);

}