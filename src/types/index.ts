export type Role = 'Administrator' | 'Doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialty: string;
  qualification?: string;
  yearsOfExperience?: number;
}

export type ChartStatus = 'Active' | 'Review Needed' | 'Archived';

export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: string;
  bloodType: string;
  assignedDoctorId: string;
  lastUpdated: string;
  status: ChartStatus;
  department: string;
  avatar?: string;
}

export interface ChartField {
  id: string;
  label: string;
  value: string;
  confidenceScore: number; // 0 to 100
  originalAudioClip?: string;
  suggestedCorrection?: string;
}

export interface PatientChart {
  patientId: string;
  chiefComplaint: string;
  fields: ChartField[];
  notes: string;
}

export type ActivityType =
'chart_created' |
'field_updated' |
'lab_uploaded' |
'imaging_uploaded' |
'ai_correction';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  userId: string;
  patientId?: string;
}

export interface ScheduleItem {
  id: string;
  patientId: string;
  patientName: string;
  dayOfWeek: number; // 1-7 (Mon-Sun)
  startTime: string; // "09:00"
  endTime: string; // "09:30"
  type: 'Consultation' | 'Follow-up' | 'Lab Review' | 'Procedure';
}

export interface Notification {
  id: string;
  type: 'assignment' | 'update';
  message: string;
  timestamp: string;
  isRead: boolean;
  patientId?: string;
}

export interface FlaggedMetric {
  label: string;
  currentValue: string;
  unit: string;
  targetValue?: string;
  severity: 'critical' | 'warning' | 'moderate';
  confidenceScore: number;
  suggestedCorrection?: string;
}

export interface FlaggedItem {
  id: string;
  patientId: string;
  patientName: string;
  avatar?: string;
  metrics: FlaggedMetric[];
  recommendation: string;
}

export interface ImagingRecord {
  id: string;
  patientId: string;
  type: string;
  date: string;
  status: 'Completed' | 'Pending';
  thumbnailUrl?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  value: string;
  referenceRange: string;
  status: 'Normal' | 'Abnormal';
  date: string;
}

export interface Announcement {
  id: string;
  type: 'patient' | 'system' | 'ai';
  message: string;
  timestamp: string;
}

export interface SavedChart {
  id: string;
  patientId: string;
  createdAt: string;
  lastModified: string;
  chiefComplaint: string;
  doctorName: string;
  vitals?: any;
  notes?: string;
}