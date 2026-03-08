import {
  Patient,
  Doctor,
  ActivityItem,
  PatientChart,
  ScheduleItem,
  Notification,
  FlaggedItem,
  ImagingRecord,
  LabResult,
  Announcement,
  SavedChart } from
'../types';

export const mockDoctors: Doctor[] = [
{
  id: 'd1',
  name: 'Dr. Sarah Chen',
  department: 'Cardiology',
  specialty: 'Interventional Cardiology',
  qualification: 'MD, FACC',
  yearsOfExperience: 15
},
{
  id: 'd2',
  name: 'Dr. Marcus Johnson',
  department: 'Neurology',
  specialty: 'Clinical Neurophysiology',
  qualification: 'MD, PhD',
  yearsOfExperience: 12
},
{
  id: 'd3',
  name: 'Dr. Emily Rodriguez',
  department: 'General Practice',
  specialty: 'Family Medicine',
  qualification: 'MD, FAAFP',
  yearsOfExperience: 8
}];


export const mockPatients: Patient[] = [
{
  id: 'P-10042',
  name: 'Eleanor Vance',
  age: 68,
  dob: '1956-03-12',
  gender: 'Female',
  bloodType: 'A+',
  assignedDoctorId: 'd1',
  lastUpdated: '2023-10-24T09:30:00Z',
  status: 'Review Needed',
  department: 'Cardiology'
},
{
  id: 'P-10043',
  name: 'James Holden',
  age: 42,
  dob: '1982-07-22',
  gender: 'Male',
  bloodType: 'O-',
  assignedDoctorId: 'd3',
  lastUpdated: '2023-10-24T10:15:00Z',
  status: 'Active',
  department: 'General Practice'
},
{
  id: 'P-10044',
  name: 'Amos Burton',
  age: 35,
  dob: '1989-11-05',
  gender: 'Male',
  bloodType: 'B+',
  assignedDoctorId: 'd2',
  lastUpdated: '2023-10-23T14:20:00Z',
  status: 'Active',
  department: 'Neurology'
},
{
  id: 'P-10045',
  name: 'Naomi Nagata',
  age: 29,
  dob: '1995-02-18',
  gender: 'Female',
  bloodType: 'AB+',
  assignedDoctorId: 'd1',
  lastUpdated: '2023-10-22T08:45:00Z',
  status: 'Archived',
  department: 'Cardiology'
},
{
  id: 'P-10046',
  name: 'Chrisjen Avasarala',
  age: 72,
  dob: '1952-09-30',
  gender: 'Female',
  bloodType: 'O+',
  assignedDoctorId: 'd3',
  lastUpdated: '2023-10-24T11:05:00Z',
  status: 'Review Needed',
  department: 'General Practice'
}];


export const mockCharts: Record<string, PatientChart> = {
  'P-10042': {
    patientId: 'P-10042',
    chiefComplaint:
    'Patient reports intermittent chest pain and shortness of breath during mild exertion over the past 2 weeks.',
    notes:
    'Patient appears anxious. Recommended stress test and updated ECG. Prescribed sublingual nitroglycerin for acute episodes.',
    fields: [
    { id: 'f1', label: 'Heart Rate', value: '78', confidenceScore: 96 },
    {
      id: 'f2',
      label: 'Blood Pressure',
      value: '128/82',
      confidenceScore: 91
    },
    {
      id: 'f3',
      label: 'Oxygen Saturation',
      value: '97',
      confidenceScore: 94
    },
    { id: 'f5', label: 'Temperature', value: '98.6', confidenceScore: 99 },
    {
      id: 'f6',
      label: 'Vitamin D Level',
      value: '24',
      confidenceScore: 62,
      suggestedCorrection: '34 ng/mL'
    }]

  }
};

export const mockActivities: ActivityItem[] = [
{
  id: 'a1',
  type: 'ai_correction',
  description:
  'AI suggested correction for Respiratory Rate on Patient P-10042',
  timestamp: '2023-10-24T09:31:00Z',
  userId: 'd1',
  patientId: 'P-10042'
},
{
  id: 'a2',
  type: 'chart_created',
  description: 'New chart created for James Holden',
  timestamp: '2023-10-24T10:15:00Z',
  userId: 'd3',
  patientId: 'P-10043'
},
{
  id: 'a3',
  type: 'lab_uploaded',
  description: 'Comprehensive Metabolic Panel results uploaded',
  timestamp: '2023-10-23T15:00:00Z',
  userId: 'system',
  patientId: 'P-10044'
},
{
  id: 'a4',
  type: 'imaging_uploaded',
  description: 'Chest X-Ray (PA/LAT) uploaded',
  timestamp: '2023-10-22T09:00:00Z',
  userId: 'system',
  patientId: 'P-10045'
},
{
  id: 'a5',
  type: 'field_updated',
  description: 'Blood pressure manually updated by Dr. Chen',
  timestamp: '2023-10-24T09:35:00Z',
  userId: 'd1',
  patientId: 'P-10042'
}];


export const mockSchedule: ScheduleItem[] = [
{
  id: 's1',
  patientId: 'P-10042',
  patientName: 'Eleanor Vance',
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '09:30',
  type: 'Consultation'
},
{
  id: 's2',
  patientId: 'P-10043',
  patientName: 'James Holden',
  dayOfWeek: 1,
  startTime: '10:00',
  endTime: '10:45',
  type: 'Follow-up'
},
{
  id: 's3',
  patientId: 'P-10044',
  patientName: 'Amos Burton',
  dayOfWeek: 2,
  startTime: '11:00',
  endTime: '11:30',
  type: 'Lab Review'
},
{
  id: 's4',
  patientId: 'P-10045',
  patientName: 'Naomi Nagata',
  dayOfWeek: 3,
  startTime: '14:00',
  endTime: '15:00',
  type: 'Procedure'
},
{
  id: 's5',
  patientId: 'P-10046',
  patientName: 'Chrisjen Avasarala',
  dayOfWeek: 4,
  startTime: '09:30',
  endTime: '10:00',
  type: 'Consultation'
},
{
  id: 's6',
  patientId: 'P-10042',
  patientName: 'Eleanor Vance',
  dayOfWeek: 5,
  startTime: '13:00',
  endTime: '13:30',
  type: 'Follow-up'
}];


export const mockNotifications: Notification[] = [
{
  id: 'n1',
  type: 'assignment',
  message: 'New patient Eleanor Vance (P-10042) has been assigned to you',
  timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  isRead: false,
  patientId: 'P-10042'
},
{
  id: 'n2',
  type: 'update',
  message:
  'Patient James Holden (P-10043) profile updated: Blood pressure changed',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  isRead: false,
  patientId: 'P-10043'
},
{
  id: 'n3',
  type: 'assignment',
  message:
  'New patient Chrisjen Avasarala (P-10046) has been assigned to you',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  isRead: true,
  patientId: 'P-10046'
},
{
  id: 'n4',
  type: 'update',
  message: 'Patient Amos Burton (P-10044) lab results uploaded',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  isRead: true,
  patientId: 'P-10044'
}];


export const mockFlaggedItems: FlaggedItem[] = [
{
  id: 'f1',
  patientId: 'P-10042',
  patientName: 'Eleanor Vance',
  recommendation:
  'Patient presents with mild fatigue and recent vitamin D deficiency. Follow-up labs recommended in 4 weeks.',
  metrics: [
  {
    label: 'VITAMIN D LEVEL',
    currentValue: '24',
    unit: 'ng/mL',
    targetValue: '30-50',
    severity: 'warning',
    confidenceScore: 62,
    suggestedCorrection: '34 ng/mL'
  },
  {
    label: 'BLOOD PRESSURE',
    currentValue: '145/90',
    unit: 'mmHg',
    targetValue: '<120/80',
    severity: 'critical',
    confidenceScore: 91
  }]

},
{
  id: 'f2',
  patientId: 'P-10043',
  patientName: 'James Holden',
  recommendation:
  'Elevated cholesterol levels detected. Recommend dietary consultation and statin therapy review.',
  metrics: [
  {
    label: 'CHOLESTEROL (LDL)',
    currentValue: '160',
    unit: 'mg/dL',
    targetValue: '<100',
    severity: 'warning',
    confidenceScore: 85
  }]

}];


export const mockImaging: ImagingRecord[] = [
{
  id: 'i1',
  patientId: 'P-10042',
  type: 'Chest X-Ray (PA/LAT)',
  date: '2023-10-20T09:00:00Z',
  status: 'Completed'
},
{
  id: 'i2',
  patientId: 'P-10042',
  type: 'MRI Brain',
  date: '2023-10-22T14:30:00Z',
  status: 'Pending'
}];


export const mockLabResults: LabResult[] = [
{
  id: 'l1',
  patientId: 'P-10042',
  testName: 'Comprehensive Metabolic Panel',
  value: 'See details',
  referenceRange: '-',
  status: 'Normal',
  date: '2023-10-21T08:00:00Z'
},
{
  id: 'l2',
  patientId: 'P-10042',
  testName: 'Vitamin D, 25-Hydroxy',
  value: '24 ng/mL',
  referenceRange: '30-100 ng/mL',
  status: 'Abnormal',
  date: '2023-10-21T08:00:00Z'
},
{
  id: 'l3',
  patientId: 'P-10042',
  testName: 'Lipid Panel',
  value: 'See details',
  referenceRange: '-',
  status: 'Abnormal',
  date: '2023-10-21T08:00:00Z'
}];


export const mockAnnouncements: Announcement[] = [
{
  id: 'an1',
  type: 'patient',
  message: 'New lab results uploaded for Eleanor Vance (P-10042)',
  timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
},
{
  id: 'an2',
  type: 'patient',
  message: 'Patient James Holden blood pressure updated to 130/85',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
},
{
  id: 'an3',
  type: 'system',
  message: 'System maintenance scheduled for Saturday 2:00 AM',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
},
{
  id: 'an4',
  type: 'ai',
  message: 'AI model updated: Accuracy improved to 98.4%',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
},
{
  id: 'an5',
  type: 'patient',
  message: 'New patient Chrisjen Avasarala assigned to your care',
  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
}];


export const mockSavedCharts: SavedChart[] = [
{
  id: 'sc1',
  patientId: 'P-10042',
  createdAt: '2023-09-15T10:00:00Z',
  lastModified: '2023-09-15T10:30:00Z',
  chiefComplaint: 'Routine follow-up for hypertension.',
  doctorName: 'Dr. Sarah Chen',
  vitals: { bp: '135/85', hr: '82' },
  notes: 'Patient stable. Continue current medication.'
},
{
  id: 'sc2',
  patientId: 'P-10042',
  createdAt: '2023-06-10T14:00:00Z',
  lastModified: '2023-06-10T14:15:00Z',
  chiefComplaint: 'Patient reported mild dizziness.',
  doctorName: 'Dr. Sarah Chen',
  vitals: { bp: '140/90', hr: '88' },
  notes: 'Advised to monitor BP daily.'
}];