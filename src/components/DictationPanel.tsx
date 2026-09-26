import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MicIcon,
  SquareIcon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  SparklesIcon } from
'lucide-react';
import { toast } from 'sonner';
interface DictationPanelProps {
  onAcceptField: (label: string, value: string) => void;
}
export function DictationPanel({ onAcceptField }: DictationPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedFields, setDetectedFields] = useState<
    {
      label: string;
      value: string;
    }[]>(
    []);
  // Simulate dictation and AI extraction
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      const phrases = [
      'Patient presents with ',
      'mild chest pain ',
      'and shortness of breath. ',
      'Heart rate is ',
      '88 beats per minute. ',
      'Blood pressure ',
      '145 over 90. '];

      let i = 0;
      interval = setInterval(() => {
        if (i < phrases.length) {
          setTranscript((prev) => prev + phrases[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
        setDetectedFields([
        {
          label: 'Heart Rate',
          value: '88 bpm'
        },
        {
          label: 'Blood Pressure',
          value: '145/90 mmHg'
        },
        {
          label: 'Chief Complaint',
          value: 'Mild chest pain and shortness of breath'
        }]
        );
        toast.success('AI extraction complete');
      }, 1500);
    } else {
      setTranscript('');
      setDetectedFields([]);
      setIsRecording(true);
      toast('Recording started...', {
        icon: <MicIcon className="h-4 w-4 text-red-500" />
      });
    }
  };
  const handleAccept = (
  field: {
    label: string;
    value: string;
  },
  index: number) =>
  {
    onAcceptField(field.label, field.value);
    setDetectedFields((prev) => prev.filter((_, i) => i !== index));
    toast.success(`Added ${field.label} to chart`);
  };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[400px]">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold">AI Dictation Assistant</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {isRecording &&
          <span className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              Recording
            </span>
          }
          <span className="text-slate-400">Press Space to toggle</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-50">
        {/* Transcript Area */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4 shadow-sm min-h-[100px]">
          {transcript ?
          <p className="text-slate-700 leading-relaxed">{transcript}</p> :

          <p className="text-slate-400 italic text-center mt-4">
              Click the microphone to start dictating...
            </p>
          }
          {isProcessing &&
          <div className="flex items-center gap-2 text-blue-600 mt-4 text-sm font-medium">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Extracting structured data...
            </div>
          }
        </div>

        {/* Detected Fields */}
        <AnimatePresence>
          {detectedFields.length > 0 &&
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}
            exit={{
              opacity: 0,
              height: 0
            }}
            className="space-y-2">

              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Detected Fields
              </h4>
              <div className="space-y-2">
                {detectedFields.map((field, idx) =>
              <motion.div
                key={idx}
                initial={{
                  opacity: 0,
                  x: -20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: 20
                }}
                className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg">

                    <div>
                      <span className="text-xs font-medium text-blue-600 block">
                        {field.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {field.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                    onClick={() => handleAccept(field, idx)}
                    className="p-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-md shadow-sm border border-emerald-100 transition-colors"
                    title="Accept">

                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                    onClick={() =>
                    setDetectedFields((prev) =>
                    prev.filter((_, i) => i !== idx)
                    )
                    }
                    className="p-1.5 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md shadow-sm border border-slate-200 transition-colors"
                    title="Reject">

                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
              )}
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex justify-center">
        <button
          onClick={toggleRecording}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md transition-all ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200 ring-4 ring-red-50' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'}`}>

          {isRecording ?
          <SquareIcon className="h-5 w-5 fill-current" /> :

          <MicIcon className="h-6 w-6" />
          }
        </button>
      </div>
    </div>);

}