import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  ActivityIcon,
  AlertTriangleIcon,
  PlayCircleIcon,
  CheckIcon,
  SaveIcon,
  ImageIcon,
  MicroscopeIcon,
  FileTextIcon,
  PlusIcon,
  XIcon,
  ClockIcon,
  FileClockIcon } from
'lucide-react';
import {
  mockPatients,
  mockCharts,
  mockDoctors,
  mockImaging,
  mockLabResults,
  mockSavedCharts } from
'../data/mockData';
import { DictationPanel } from '../components/DictationPanel';
import { ExtractedField } from '../lib/extractFields';
import { toast } from 'sonner';
import { SavedChart } from '../types';
type TabType = 'details' | 'imaging' | 'labs' | 'new_chart';
export function PatientChartPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const [searchParams] = useSearchParams();
  const fieldToHighlight = searchParams.get('field');
  const patient = mockPatients.find((p) => p.id === id);
  const initialChart = mockCharts[id || ''] || {
    fields: [],
    notes: '',
    chiefComplaint: ''
  };
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [chartData, setChartData] = useState(initialChart);
  const [initialChartData, setInitialChartData] = useState(initialChart);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localActivityLog, setLocalActivityLog] = useState<
    {
      message: string;
      time: string;
    }[]>(
    []);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>(
    mockSavedCharts.filter((c) => c.patientId === id)
  );
  const [selectedChart, setSelectedChart] = useState<SavedChart | null>(null);
  const [newChartData, setNewChartData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    reasonForVisit: '',
    appointmentType: 'Follow-up',
    height: '',
    weight: '',
    bloodPressure: '',
    pulseRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: '',
    symptoms: [''],
    durationOfSymptoms: '',
    severityLevel: 'Mild',
    additionalSymptomNotes: '',
    pastIllness: '',
    previousSurgeries: '',
    allergies: '',
    familyMedicalHistory: '',
    currentMedications: '',
    hemoglobin: '',
    vitaminD: '',
    bloodSugar: '',
    cholesterol: '',
    plateletCount: '',
    thyroid: '',
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    clinicalAssessment: '',
    prescriptions: [
    {
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }],

    doctorObservations: '',
    patientConditionNotes: '',
    additionalComments: '',
    nextVisitDate: '',
    followUpInstructions: '',
    lifestyleAdvice: '',
    extractedFields: [] as any[]
  });
  const fieldRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  useEffect(() => {
    if (fieldToHighlight) {
      setActiveTab('details');
      setTimeout(() => {
        const ref =
        fieldRefs.current[fieldToHighlight.toUpperCase()] ||
        fieldRefs.current[fieldToHighlight];
        if (ref) {
          ref.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          ref.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
          setTimeout(
            () =>
            ref.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'),
            3000
          );
        }
      }, 100);
    }
  }, [fieldToHighlight]);
  useEffect(() => {
    setHasUnsavedChanges(
      JSON.stringify(chartData) !== JSON.stringify(initialChartData)
    );
  }, [chartData, initialChartData]);
  if (!patient)
  return (
    <div className="p-8 text-center text-slate-500">Patient not found</div>);

  const doctor = mockDoctors.find((d) => d.id === patient.assignedDoctorId);
  const patientImaging = mockImaging.filter((i) => i.patientId === patient.id);
  const patientLabs = mockLabResults.filter((l) => l.patientId === patient.id);
  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setInitialChartData(chartData);
      setHasUnsavedChanges(false);
      setLocalActivityLog((prev) => [
      {
        message: `Chart updated by ${doctor?.name || 'Doctor'}`,
        time: new Date().toLocaleTimeString()
      },
      ...prev]
      );
      toast.success('Changes saved successfully');
    }, 800);
  };
  const handleSaveNewChart = () => {
    const newSavedChart: SavedChart = {
      id: `sc-${Date.now()}`,
      patientId: patient.id,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      chiefComplaint: newChartData.reasonForVisit || 'New consultation',
      doctorName: doctor?.name || 'Doctor',
      vitals: {
        bp: newChartData.bloodPressure,
        hr: newChartData.pulseRate
      },
      notes: newChartData.doctorObservations
    };
    setSavedCharts((prev) => [newSavedChart, ...prev]);
    toast.success('New chart saved successfully');
    setActiveTab('details');
  };
  const handleAcceptDictationField = (field: ExtractedField) => {
    const { key, label, value, formValue } = field;
    setNewChartData((prev) => {
      // 1. Write the value into the matching form input
      let next = { ...prev } as typeof prev;
      if (key === 'symptoms') {
        const incoming = formValue.split('|').filter(Boolean);
        const existing = prev.symptoms.filter((s) => s.trim());
        const merged = [...existing];
        incoming.forEach((s) => {
          if (!merged.some((m) => m.toLowerCase() === s.toLowerCase())) merged.push(s);
        });
        next.symptoms = merged.length ? merged : [''];
      } else {
        next = { ...next, [key]: formValue };
      }
      // 2. Keep a list of what the AI filled in
      const existingFieldIndex = prev.extractedFields.findIndex((f) => f.label === label);
      const entry = {
        id: `new-${Date.now()}-${key}`,
        label,
        value,
        confidenceScore: field.confidenceScore
      };
      const extractedFields = [...prev.extractedFields];
      if (existingFieldIndex >= 0) extractedFields[existingFieldIndex] = entry;else
      extractedFields.push(entry);
      return { ...next, extractedFields };
    });
  };
  const getConfidenceColor = (score: number) => {
    if (score >= 95) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };
  const tabs = [
  {
    id: 'details',
    label: 'Patient Details',
    icon: UserIcon
  },
  {
    id: 'imaging',
    label: 'Imaging Uploads',
    icon: ImageIcon
  },
  {
    id: 'labs',
    label: 'Lab Results',
    icon: MicroscopeIcon
  },
  {
    id: 'new_chart',
    label: 'New Patient Chart',
    icon: FileTextIcon
  }] as
  const;
  const FormRow = ({
    label,
    children



  }: {label: string;children: React.ReactNode;}) =>
  <div className="flex border-b border-slate-100 last:border-b-0">
      <div className="w-1/3 px-5 py-3 bg-slate-50/50 text-sm font-medium text-slate-700 border-r border-slate-100 flex items-center">
        {label}
      </div>
      <div className="w-2/3 px-5 py-3">{children}</div>
    </div>;

  const SectionHeader = ({
    number,
    title



  }: {number: number;title: string;}) =>
  <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 rounded-t-xl">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-white text-xs">
          {number}
        </span>
        {title}
      </h3>
    </div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/patients"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">

            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {patient.name}
              <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {patient.id}
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Last updated: {new Date(patient.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        {tabs.map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg'}`}>

            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.id &&
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />

          }
          </button>
        )}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
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
            y: -10
          }}
          transition={{
            duration: 0.2
          }}>

          {activeTab === 'details' &&
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Panel: Patient Info & Previous Charts */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                      {patient.name.
                    split(' ').
                    map((n) => n[0]).
                    join('')}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {patient.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {patient.gender}, {patient.age} yrs
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">
                          DOB
                        </p>
                        <p className="text-sm text-slate-900 font-medium">
                          {new Date(patient.dob).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ActivityIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">
                          Blood Type
                        </p>
                        <p className="text-sm text-slate-900 font-medium">
                          {patient.bloodType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase">
                          Assigned Doctor
                        </p>
                        <p className="text-sm text-slate-900 font-medium">
                          {doctor?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {doctor?.department}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous Charts Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <FileClockIcon className="h-4 w-4 text-blue-600" />
                      Previous Charts
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {savedCharts.length > 0 ?
                  savedCharts.map((chart) =>
                  <div
                    key={chart.id}
                    onClick={() => setSelectedChart(chart)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors">

                          <p className="text-sm font-medium text-slate-900">
                            {new Date(chart.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {chart.chiefComplaint}
                          </p>
                        </div>
                  ) :

                  <div className="p-4 text-center text-sm text-slate-500">
                        No previous charts
                      </div>
                  }
                  </div>
                </div>

                {localActivityLog.length > 0 &&
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-slate-400" />
                      Recent Session Activity
                    </h3>
                    <div className="space-y-3">
                      {localActivityLog.map((log, i) =>
                  <div key={i} className="flex items-start gap-3 text-sm">
                          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                          <div>
                            <p className="text-slate-700">{log.message}</p>
                            <p className="text-xs text-slate-400">{log.time}</p>
                          </div>
                        </div>
                  )}
                    </div>
                  </div>
              }
              </div>

              {/* Right Panel: EHR Fields */}
              <div className="lg:col-span-9 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-900">
                      Structured Medical Record
                    </h2>
                  </div>

                  <div className="p-6 space-y-8">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Chief Complaint
                      </label>
                      <textarea
                      value={chartData.chiefComplaint}
                      onChange={(e) =>
                      setChartData({
                        ...chartData,
                        chiefComplaint: e.target.value
                      })
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[80px]" />

                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <ActivityIcon className="h-4 w-4 text-blue-500" />
                        Vitals & Measurements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {chartData.fields.map((field, idx) =>
                      <div
                        key={field.id}
                        ref={(el) =>
                        fieldRefs.current[field.label.toUpperCase()] =
                        el
                        }
                        className={`p-4 rounded-lg border transition-all duration-500 ${field.confidenceScore < 90 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>

                            <div className="flex justify-between items-start mb-2">
                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {field.label}
                              </label>
                              <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getConfidenceColor(field.confidenceScore)}`}>

                                {field.confidenceScore < 90 &&
                            <AlertTriangleIcon className="h-3 w-3" />
                            }
                                {field.confidenceScore}% AI Confidence
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                            type="text"
                            value={field.value}
                            onChange={(e) => {
                              const newFields = [...chartData.fields];
                              newFields[idx].value = e.target.value;
                              setChartData({
                                ...chartData,
                                fields: newFields
                              });
                            }}
                            className="flex-1 p-2 bg-transparent border-b border-slate-300 focus:border-blue-500 focus:outline-none text-slate-900 font-medium transition-colors" />

                            </div>

                            {field.suggestedCorrection &&
                        field.confidenceScore < 90 &&
                        <div className="mt-3 p-2 bg-white rounded border border-amber-100 flex items-start justify-between gap-2">
                                  <div>
                                    <span className="text-xs text-amber-600 font-medium block mb-0.5">
                                      Suggested Correction:
                                    </span>
                                    <span className="text-sm text-slate-700">
                                      {field.suggestedCorrection}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Play Original Audio">

                                      <PlayCircleIcon className="h-4 w-4" />
                                    </button>
                                    <button
                              onClick={() => {
                                const newFields = [...chartData.fields];
                                newFields[idx].value =
                                field.suggestedCorrection!;
                                newFields[idx].confidenceScore = 100;
                                newFields[idx].suggestedCorrection =
                                undefined;
                                setChartData({
                                  ...chartData,
                                  fields: newFields
                                });
                                toast.success('Correction applied');
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                              title="Accept Suggestion">

                                      <CheckIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                        }
                          </div>
                      )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Clinical Notes
                      </label>
                      <textarea
                      value={chartData.notes}
                      onChange={(e) =>
                      setChartData({
                        ...chartData,
                        notes: e.target.value
                      })
                      }
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[150px]" />

                    </div>

                    {/* Save Changes Button at bottom */}
                    <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
                      {hasUnsavedChanges &&
                    <span className="text-sm font-medium text-amber-600 flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                          Unsaved changes
                        </span>
                    }
                      <button
                      onClick={handleSaveChanges}
                      disabled={isSaving || !hasUnsavedChanges}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">

                        {isSaving ?
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :

                      <SaveIcon className="h-4 w-4" />
                      }
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          {activeTab === 'imaging' &&
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">
                  Imaging Records
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {patientImaging.length > 0 ?
              patientImaging.map((record) =>
              <div
                key={record.id}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">

                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {record.type}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${record.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>

                          {record.status}
                        </span>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          View
                        </button>
                      </div>
                    </div>
              ) :

              <div className="p-8 text-center text-slate-500">
                    No imaging records found.
                  </div>
              }
              </div>
            </div>
          }

          {activeTab === 'labs' &&
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">
                  Laboratory Results
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Test Name
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Value
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Reference Range
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {patientLabs.length > 0 ?
                  patientLabs.map((lab) =>
                  <tr key={lab.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {lab.testName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                            {lab.value}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {lab.referenceRange}
                          </td>
                          <td className="px-6 py-4">
                            <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${lab.status === 'Normal' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>

                              {lab.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(lab.date).toLocaleDateString()}
                          </td>
                        </tr>
                  ) :

                  <tr>
                        <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500">

                          No lab results found.
                        </td>
                      </tr>
                  }
                  </tbody>
                </table>
              </div>
            </div>
          }

          {activeTab === 'new_chart' &&
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                {/* Section 1: Patient Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={1} title="Patient Information" />
                  <div className="p-5 bg-slate-50/50">
                    <p className="text-xs text-slate-500 mb-4 italic">
                      Personal details managed by administrator
                    </p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Name</span>
                        <span className="font-medium text-slate-900">
                          {patient.name}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Patient ID</span>
                        <span className="font-medium text-slate-900">
                          {patient.id}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Age / DOB</span>
                        <span className="font-medium text-slate-900">
                          {patient.age} /{' '}
                          {new Date(patient.dob).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Gender</span>
                        <span className="font-medium text-slate-900">
                          {patient.gender}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Blood Type</span>
                        <span className="font-medium text-slate-900">
                          {patient.bloodType}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Department</span>
                        <span className="font-medium text-slate-900">
                          {patient.department}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Visit Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={2} title="Visit Information" />
                  <div>
                    <FormRow label="Visit Date">
                      <input
                      type="date"
                      value={newChartData.visitDate}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        visitDate: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Doctor Name">
                      <input
                      type="text"
                      readOnly
                      value={doctor?.name || ''}
                      className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-2.5 text-sm cursor-not-allowed" />

                    </FormRow>
                    <FormRow label="Department / Specialization">
                      <input
                      type="text"
                      readOnly
                      value={`${doctor?.department || ''} / ${doctor?.specialty || ''}`}
                      className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-2.5 text-sm cursor-not-allowed" />

                    </FormRow>
                    <FormRow label="Reason for Visit">
                      <input
                      type="text"
                      value={newChartData.reasonForVisit}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        reasonForVisit: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Appointment Type">
                      <select
                      value={newChartData.appointmentType}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        appointmentType: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">

                        <option>New</option>
                        <option>Follow-up</option>
                      </select>
                    </FormRow>
                  </div>
                </div>

                {/* Section 3: Vital Signs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={3} title="Vital Signs" />
                  <div>
                    <FormRow label="Height (cm)">
                      <input
                      type="number"
                      value={newChartData.height}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        height: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Weight (kg)">
                      <input
                      type="number"
                      value={newChartData.weight}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        weight: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Blood Pressure (Sys/Dia)">
                      <input
                      type="text"
                      value={newChartData.bloodPressure}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        bloodPressure: e.target.value
                      })
                      }
                      placeholder="120/80"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Pulse Rate (bpm)">
                      <input
                      type="number"
                      value={newChartData.pulseRate}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        pulseRate: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Respiratory Rate">
                      <input
                      type="number"
                      value={newChartData.respiratoryRate}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        respiratoryRate: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Body Temperature (°C)">
                      <input
                      type="number"
                      value={newChartData.temperature}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        temperature: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Oxygen Saturation (SpO2 %)">
                      <input
                      type="number"
                      value={newChartData.oxygenSaturation}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        oxygenSaturation: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Body Mass Index (BMI)">
                      <input
                      type="text"
                      readOnly
                      value={
                      newChartData.height && newChartData.weight ?
                      (
                      Number(newChartData.weight) /
                      Math.pow(Number(newChartData.height) / 100, 2)).
                      toFixed(1) :
                      ''
                      }
                      className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-2.5 text-sm cursor-not-allowed"
                      placeholder="Auto-calculated" />

                    </FormRow>
                  </div>
                </div>

                {/* Section 4: Symptoms */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={4} title="Symptoms" />
                  <div>
                    {newChartData.symptoms.map((symptom, idx) =>
                  <FormRow key={idx} label={`Symptom ${idx + 1}`}>
                        <div className="flex gap-2">
                          <input
                        type="text"
                        value={symptom}
                        onChange={(e) => {
                          const newSymptoms = [...newChartData.symptoms];
                          newSymptoms[idx] = e.target.value;
                          setNewChartData({
                            ...newChartData,
                            symptoms: newSymptoms
                          });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                          <button
                        onClick={() => {
                          const newSymptoms = newChartData.symptoms.filter(
                            (_, i) => i !== idx
                          );
                          setNewChartData({
                            ...newChartData,
                            symptoms: newSymptoms.length ?
                            newSymptoms :
                            ['']
                          });
                        }}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">

                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </FormRow>
                  )}
                    <div className="px-5 py-3 border-b border-slate-100 flex justify-end">
                      <button
                      onClick={() =>
                      setNewChartData({
                        ...newChartData,
                        symptoms: [...newChartData.symptoms, '']
                      })
                      }
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5">

                        <PlusIcon className="h-4 w-4" /> Add Symptom
                      </button>
                    </div>
                    <FormRow label="Duration of Symptoms">
                      <input
                      type="text"
                      value={newChartData.durationOfSymptoms}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        durationOfSymptoms: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Severity Level">
                      <select
                      value={newChartData.severityLevel}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        severityLevel: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">

                        <option>Mild</option>
                        <option>Moderate</option>
                        <option>Severe</option>
                      </select>
                    </FormRow>
                    <FormRow label="Additional Notes">
                      <textarea
                      value={newChartData.additionalSymptomNotes}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        additionalSymptomNotes: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                  </div>
                </div>

                {/* Section 5: Medical History */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={5} title="Medical History" />
                  <div>
                    <FormRow label="Past Illness">
                      <textarea
                      value={newChartData.pastIllness}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        pastIllness: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                    <FormRow label="Previous Surgeries">
                      <textarea
                      value={newChartData.previousSurgeries}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        previousSurgeries: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                    <FormRow label="Allergies">
                      <textarea
                      value={newChartData.allergies}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        allergies: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                    <FormRow label="Family Medical History">
                      <textarea
                      value={newChartData.familyMedicalHistory}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        familyMedicalHistory: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                    <FormRow label="Current Medications">
                      <textarea
                      value={newChartData.currentMedications}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        currentMedications: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                  </div>
                </div>

                {/* Section 6: Laboratory Results */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={6} title="Laboratory Results" />
                  <div>
                    <FormRow label="Hemoglobin Level">
                      <input
                      type="text"
                      value={newChartData.hemoglobin}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        hemoglobin: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Vitamin D Level">
                      <input
                      type="text"
                      value={newChartData.vitaminD}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        vitaminD: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Blood Sugar (Fasting/Random)">
                      <input
                      type="text"
                      value={newChartData.bloodSugar}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        bloodSugar: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Cholesterol Level">
                      <input
                      type="text"
                      value={newChartData.cholesterol}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        cholesterol: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Platelet Count">
                      <input
                      type="text"
                      value={newChartData.plateletCount}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        plateletCount: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Thyroid (TSH)">
                      <input
                      type="text"
                      value={newChartData.thyroid}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        thyroid: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                  </div>
                </div>

                {/* Section 7: Diagnosis */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={7} title="Diagnosis" />
                  <div>
                    <FormRow label="Primary Diagnosis">
                      <input
                      type="text"
                      value={newChartData.primaryDiagnosis}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        primaryDiagnosis: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Secondary Diagnosis">
                      <input
                      type="text"
                      value={newChartData.secondaryDiagnosis}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        secondaryDiagnosis: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Clinical Assessment">
                      <textarea
                      value={newChartData.clinicalAssessment}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        clinicalAssessment: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" />

                    </FormRow>
                  </div>
                </div>

                {/* Section 8: Prescription */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={8} title="Prescription" />
                  <div>
                    {newChartData.prescriptions.map((rx, idx) =>
                  <div
                    key={idx}
                    className="border-b border-slate-200 last:border-b-0 pb-4 mb-4 last:mb-0 last:pb-0">

                        <div className="px-5 py-2 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 uppercase">
                            Medication {idx + 1}
                          </span>
                          <button
                        onClick={() => {
                          const newRx = newChartData.prescriptions.filter(
                            (_, i) => i !== idx
                          );
                          setNewChartData({
                            ...newChartData,
                            prescriptions: newRx.length ?
                            newRx :
                            [
                            {
                              medicineName: '',
                              dosage: '',
                              frequency: '',
                              duration: '',
                              instructions: ''
                            }]

                          });
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors">

                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <FormRow label="Medicine Name">
                          <input
                        type="text"
                        value={rx.medicineName}
                        onChange={(e) => {
                          const newRx = [...newChartData.prescriptions];
                          newRx[idx].medicineName = e.target.value;
                          setNewChartData({
                            ...newChartData,
                            prescriptions: newRx
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                        </FormRow>
                        <FormRow label="Dosage">
                          <input
                        type="text"
                        value={rx.dosage}
                        onChange={(e) => {
                          const newRx = [...newChartData.prescriptions];
                          newRx[idx].dosage = e.target.value;
                          setNewChartData({
                            ...newChartData,
                            prescriptions: newRx
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                        </FormRow>
                        <FormRow label="Frequency">
                          <input
                        type="text"
                        value={rx.frequency}
                        onChange={(e) => {
                          const newRx = [...newChartData.prescriptions];
                          newRx[idx].frequency = e.target.value;
                          setNewChartData({
                            ...newChartData,
                            prescriptions: newRx
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                        </FormRow>
                        <FormRow label="Duration">
                          <input
                        type="text"
                        value={rx.duration}
                        onChange={(e) => {
                          const newRx = [...newChartData.prescriptions];
                          newRx[idx].duration = e.target.value;
                          setNewChartData({
                            ...newChartData,
                            prescriptions: newRx
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                        </FormRow>
                        <FormRow label="Special Instructions">
                          <input
                        type="text"
                        value={rx.instructions}
                        onChange={(e) => {
                          const newRx = [...newChartData.prescriptions];
                          newRx[idx].instructions = e.target.value;
                          setNewChartData({
                            ...newChartData,
                            prescriptions: newRx
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                        </FormRow>
                      </div>
                  )}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <button
                      onClick={() =>
                      setNewChartData({
                        ...newChartData,
                        prescriptions: [
                        ...newChartData.prescriptions,
                        {
                          medicineName: '',
                          dosage: '',
                          frequency: '',
                          duration: '',
                          instructions: ''
                        }]

                      })
                      }
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5">

                        <PlusIcon className="h-4 w-4" /> Add Another Medicine
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 9: Clinical Notes */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={9} title="Clinical Notes" />
                  <div>
                    <FormRow label="Doctor Observations">
                      <textarea
                      value={newChartData.doctorObservations}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        doctorObservations: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                    <FormRow label="Patient Condition Notes">
                      <textarea
                      value={newChartData.patientConditionNotes}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        patientConditionNotes: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                    <FormRow label="Additional Clinical Comments">
                      <textarea
                      value={newChartData.additionalComments}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        additionalComments: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                  </div>
                </div>

                {/* Section 10: Follow-Up */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <SectionHeader number={10} title="Follow-Up" />
                  <div>
                    <FormRow label="Next Visit Date">
                      <input
                      type="date"
                      value={newChartData.nextVisitDate}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        nextVisitDate: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                    </FormRow>
                    <FormRow label="Follow-Up Instructions">
                      <textarea
                      value={newChartData.followUpInstructions}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        followUpInstructions: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                    <FormRow label="Lifestyle / Dietary Advice">
                      <textarea
                      value={newChartData.lifestyleAdvice}
                      onChange={(e) =>
                      setNewChartData({
                        ...newChartData,
                        lifestyleAdvice: e.target.value
                      })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" />

                    </FormRow>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                  onClick={handleSaveNewChart}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">

                    <SaveIcon className="h-5 w-5" />
                    Save New Chart
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  <DictationPanel onAcceptField={handleAcceptDictationField} />
                  {newChartData.extractedFields.length > 0 &&
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">
                        Extracted Fields
                      </h3>
                      <div className="space-y-2">
                        {newChartData.extractedFields.map((field, idx) =>
                    <div
                      key={idx}
                      className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">

                            <span className="text-xs font-medium text-blue-700">
                              {field.label}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {field.value}
                            </span>
                          </div>
                    )}
                      </div>
                    </div>
                }
                </div>
              </div>
            </div>
          }
        </motion.div>
      </AnimatePresence>

      {/* Modal for Previous Chart Details */}
      <AnimatePresence>
        {selectedChart &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Chart Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Created:{' '}
                    {new Date(selectedChart.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Save
                  </button>
                  <button
                  onClick={() => setSelectedChart(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-2">

                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Doctor
                  </h3>
                  <p className="text-slate-900 font-medium">
                    {selectedChart.doctorName}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Chief Complaint
                  </h3>
                  <p className="text-slate-900 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {selectedChart.chiefComplaint}
                  </p>
                </div>
                {selectedChart.vitals &&
              <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 block">
                          Blood Pressure
                        </span>
                        <span className="font-medium text-slate-900">
                          {selectedChart.vitals.bp}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-500 block">
                          Heart Rate
                        </span>
                        <span className="font-medium text-slate-900">
                          {selectedChart.vitals.hr}
                        </span>
                      </div>
                    </div>
                  </div>
              }
                {selectedChart.notes &&
              <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Clinical Notes
                    </h3>
                    <p className="text-slate-900 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {selectedChart.notes}
                    </p>
                  </div>
              }
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}