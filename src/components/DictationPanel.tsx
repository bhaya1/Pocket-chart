import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MicIcon,
  SquareIcon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  SparklesIcon,
  WandSparklesIcon,
  Trash2Icon,
  AlertTriangleIcon,
  CheckCheckIcon } from
'lucide-react';
import { toast } from 'sonner';
import { extractFields, ExtractedField } from '../lib/extractFields';

// ---- Minimal typings for the browser Web Speech API (Chrome / Edge / Safari) ----
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

const LANGUAGES = [
{ code: 'en-IN', label: 'English (India)' },
{ code: 'en-US', label: 'English (US)' },
{ code: 'en-GB', label: 'English (UK)' }];


const SAMPLE_TEXT =
'Patient complains of mild chest pain and shortness of breath for 2 days. ' +
'Heart rate is 88 beats per minute. Blood pressure 145 over 90. ' +
'Temperature 99 degrees Fahrenheit. Oxygen saturation 96 percent. ' +
'Allergic to penicillin. Currently taking amlodipine.';

interface DictationPanelProps {
  onAcceptField: (field: ExtractedField) => void;
}

export function DictationPanel({ onAcceptField }: DictationPanelProps) {
  const [isSupported] = useState(() => getRecognitionCtor() !== null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [lang, setLang] = useState(() => {
    const nav = navigator.language || 'en-IN';
    return LANGUAGES.some((l) => l.code === nav) ? nav : 'en-IN';
  });
  const [detectedFields, setDetectedFields] = useState<ExtractedField[]>([]);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantRecordingRef = useRef(false);
  const transcriptRef = useRef('');
  transcriptRef.current = transcript;

  const runExtraction = useCallback((text: string) => {
    if (!text.trim()) {
      toast.error('Nothing to extract yet. Speak or type some notes first.');
      return;
    }
    setIsProcessing(true);
    // small delay so the "extracting" state is visible
    setTimeout(() => {
      const fields = extractFields(text);
      setDetectedFields(fields);
      setIsProcessing(false);
      if (fields.length) {
        toast.success(`AI extracted ${fields.length} field${fields.length > 1 ? 's' : ''}`);
      } else {
        toast('No chart fields recognised', {
          description: 'Try phrases like "heart rate 80", "BP 120 over 80", "complains of headache".'
        });
      }
    }, 400);
  }, []);

  const stopRecording = useCallback(() => {
    wantRecordingRef.current = false;
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterim('');
  }, []);

  const startRecording = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      toast.error('Voice input is not supported in this browser', {
        description: 'Use Google Chrome or Microsoft Edge, or type your notes in the box.'
      });
      return;
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;else
        interimChunk += r[0].transcript;
      }
      if (finalChunk) {
        setTranscript((prev) => {
          const sep = prev && !/\s$/.test(prev) ? ' ' : '';
          return prev + sep + finalChunk.trim() + '. ';
        });
      }
      setInterim(interimChunk);
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      wantRecordingRef.current = false;
      setIsRecording(false);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        toast.error('Microphone access blocked', {
          description: 'Click the lock / mic icon in the address bar, allow the microphone, and try again.'
        });
      } else if (e.error === 'network') {
        toast.error('Speech service unreachable', {
          description: 'Chrome/Edge voice typing needs an internet connection.'
        });
      } else if (e.error === 'audio-capture') {
        toast.error('No microphone found', { description: 'Plug in or enable a microphone.' });
      } else {
        toast.error(`Voice input error: ${e.error}`);
      }
    };

    // Chrome ends the session after a pause; restart it while the doctor is still "recording".
    rec.onend = () => {
      if (wantRecordingRef.current) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      } else {
        setIsRecording(false);
        setInterim('');
        // let the last final result render before extracting
        setTimeout(() => {
          if (transcriptRef.current.trim()) runExtraction(transcriptRef.current);
        }, 150);
      }
    };

    try {
      rec.start();
    } catch {
      toast.error('Could not start the microphone. Try again.');
      return;
    }
    recognitionRef.current = rec;
    wantRecordingRef.current = true;
    setDetectedFields([]);
    setIsRecording(true);
    toast('Listening… speak your notes', {
      icon: <MicIcon className="h-4 w-4 text-red-500" />
    });
  }, [lang, runExtraction]);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();else
    startRecording();
  }, [isRecording, startRecording, stopRecording]);

  // Space bar toggles recording (unless typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const el = e.target as HTMLElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON' || el?.isContentEditable) return;
      e.preventDefault();
      toggleRecording();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleRecording]);

  // Stop the mic if the panel unmounts
  useEffect(
    () => () => {
      wantRecordingRef.current = false;
      recognitionRef.current?.abort();
    },
    []
  );

  const handleAccept = (field: ExtractedField) => {
    onAcceptField(field);
    setDetectedFields((prev) => prev.filter((f) => f.key !== field.key));
    toast.success(`Added ${field.label} to chart`);
  };

  const handleAcceptAll = () => {
    detectedFields.forEach((f) => onAcceptField(f));
    toast.success(`Added ${detectedFields.length} fields to chart`);
    setDetectedFields([]);
  };

  const badge = (score: number) =>
  score >= 95 ?
  'bg-emerald-100 text-emerald-700' :
  score >= 80 ?
  'bg-amber-100 text-amber-700' :
  'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold">AI Dictation Assistant</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {isRecording ?
          <span className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              Listening
            </span> :

          <span className="text-slate-400 hidden xl:inline">Space to start/stop</span>
          }
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 bg-slate-50">
        {!isSupported &&
        <div className="flex gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5">
            <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Voice input needs Google Chrome or Microsoft Edge. You can still type or paste notes below and
              click Extract.
            </span>
          </div>
        }

        <div className="flex items-center justify-between gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={isRecording}
            className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            title="Recognition language">

            {LANGUAGES.map((l) =>
            <option key={l.code} value={l.code}>
                {l.label}
              </option>
            )}
          </select>
          <button
            type="button"
            onClick={() => setTranscript(SAMPLE_TEXT)}
            disabled={isRecording}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">

            Load sample
          </button>
        </div>

        {/* Transcript (editable) */}
        <div className="relative">
          <textarea
            value={transcript + (interim ? interim : '')}
            onChange={(e) => {
              if (!isRecording) setTranscript(e.target.value);
            }}
            readOnly={isRecording}
            rows={6}
            placeholder={
            isSupported ?
            'Click the microphone and speak, e.g. "Patient complains of headache for 2 days. Heart rate 84. BP 120 over 80. Temperature 99 F."' :
            'Type or paste visit notes here…'
            }
            className="w-full bg-white rounded-lg border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" />

          {interim &&
          <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 italic">hearing…</span>
          }
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => runExtraction(transcript)}
            disabled={isRecording || isProcessing || !transcript.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">

            <WandSparklesIcon className="h-4 w-4" />
            Extract fields
          </button>
          <button
            type="button"
            onClick={() => {
              setTranscript('');
              setInterim('');
              setDetectedFields([]);
            }}
            disabled={isRecording || !transcript}
            className="flex items-center justify-center gap-1.5 text-sm font-medium bg-white border border-slate-200 text-slate-600 rounded-lg px-3 py-2 hover:bg-slate-100 disabled:opacity-50"
            title="Clear transcript">

            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>

        {isProcessing &&
        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Extracting structured data…
          </div>
        }

        {/* Detected Fields */}
        <AnimatePresence>
          {detectedFields.length > 0 &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2">

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Detected Fields
                </h4>
                <button
                type="button"
                onClick={handleAcceptAll}
                className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800">

                  <CheckCheckIcon className="h-3.5 w-3.5" />
                  Accept all
                </button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {detectedFields.map((field) =>
              <motion.div
                key={field.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between gap-2 p-3 rounded-lg border ${field.confidenceScore < 80 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-blue-600">{field.label}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge(field.confidenceScore)}`}>
                          {field.confidenceScore}%
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 block break-words">
                        {field.value}
                      </span>
                      {field.note &&
                  <span className="text-[11px] text-amber-700 flex items-center gap-1 mt-0.5">
                          <AlertTriangleIcon className="h-3 w-3" />
                          {field.note}
                        </span>
                  }
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                    onClick={() => handleAccept(field)}
                    className="p-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-md shadow-sm border border-emerald-100 transition-colors"
                    title="Accept into chart">

                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                    onClick={() => setDetectedFields((prev) => prev.filter((f) => f.key !== field.key))}
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

      <div className="p-4 bg-white border-t border-slate-200 flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={!isSupported}
          title={isSupported ? (isRecording ? 'Stop' : 'Start dictation') : 'Voice input not supported in this browser'}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200 ring-4 ring-red-50' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'}`}>

          {isRecording ? <SquareIcon className="h-5 w-5 fill-current" /> : <MicIcon className="h-6 w-6" />}
        </button>
        <span className="text-xs text-slate-500">
          {isRecording ? 'Tap to stop and extract' : isSupported ? 'Tap to dictate' : 'Voice unavailable'}
        </span>
      </div>
    </div>);

}
