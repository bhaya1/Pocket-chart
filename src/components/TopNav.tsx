import { useEffect, useState, useRef } from 'react';
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  UserPlusIcon,
  ActivityIcon,
  CheckIcon,
  LogOutIcon } from
'lucide-react';
import { User } from '../types';
import { mockNotifications, mockDoctors } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
interface TopNavProps {
  user: User;
}
export function TopNav({ user }: TopNavProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  // Find doctor details if user is a doctor
  const doctorDetails =
  user.role === 'Doctor' ?
  mockDoctors.find((d) => d.name === user.name) :
  null;
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
      notifRef.current &&
      !notifRef.current.contains(event.target as Node))
      {
        setShowNotifications(false);
      }
      if (
      profileRef.current &&
      !profileRef.current.contains(event.target as Node))
      {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        isRead: true
      }))
    );
  };
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 sticky top-0 z-10">
      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">

            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 &&
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            }
          </button>

          <AnimatePresence>
            {showNotifications &&
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.95
              }}
              transition={{
                duration: 0.15
              }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">

                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Notifications
                  </h3>
                  {unreadCount > 0 &&
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">

                      <CheckIcon className="h-3 w-3" />
                      Mark all as read
                    </button>
                }
                </div>
                <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length > 0 ?
                notifications.map((notification) =>
                <div
                  key={notification.id}
                  className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>

                        <div className="mt-0.5 flex-shrink-0">
                          {notification.type === 'assignment' ?
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <UserPlusIcon className="h-4 w-4" />
                            </div> :

                    <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                              <ActivityIcon className="h-4 w-4" />
                            </div>
                    }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                      className={`text-sm ${!notification.isRead ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>

                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.isRead &&
                  <div className="flex-shrink-0 flex items-center justify-center w-2">
                            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                          </div>
                  }
                      </div>
                ) :

                <div className="p-6 text-center text-sm text-slate-500">
                      No notifications
                    </div>
                }
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-lg transition-colors">

            {user.avatar ?
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover border border-slate-200" /> :


            <UserCircleIcon className="h-8 w-8 text-slate-400" />
            }
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-slate-900 leading-none">
                {user.name}
              </span>
              <span className="text-xs text-slate-500 mt-1">{user.role}</span>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-slate-400 ml-1" />
          </button>

          <AnimatePresence>
            {showProfile &&
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.95
              }}
              transition={{
                duration: 0.15
              }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">

                <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center bg-slate-50/50">
                  <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-3">
                    {user.name.
                  split(' ').
                  map((n) => n[0]).
                  join('')}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {user.name}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">
                    {doctorDetails?.qualification || user.role}
                  </p>
                </div>

                {doctorDetails &&
              <div className="p-4 space-y-3 text-sm border-b border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department</span>
                      <span className="font-medium text-slate-900">
                        {doctorDetails.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Specialization</span>
                      <span className="font-medium text-slate-900">
                        {doctorDetails.specialty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Experience</span>
                      <span className="font-medium text-slate-900">
                        {doctorDetails.yearsOfExperience} Years
                      </span>
                    </div>
                  </div>
              }

                <div className="p-2">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOutIcon className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </header>);

}