import { motion } from 'framer-motion';
import { AlertTriangleIcon } from 'lucide-react';
import { mockFlaggedItems } from '../data/mockData';
import { Link } from 'react-router-dom';
export function FlaggedPage() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-400';
      case 'warning':
        return 'border-amber-400';
      default:
        return 'border-blue-400';
    }
  };
  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };
  const getConfidenceBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-700';
    if (score >= 70) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Flagged Health Improvements
        </h1>
        <p className="text-slate-500 mt-1">
          AI-detected areas where patients need health improvements.
        </p>
      </div>

      <div className="space-y-8">
        {mockFlaggedItems.map((item, index) =>
        <motion.div
          key={item.id}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.1
          }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {item.patientName.
              split(' ').
              map((n) => n[0]).
              join('')}
              </div>
              <div>
                <Link
                to={`/patients/${item.patientId}`}
                className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors block">

                  {item.patientName}
                </Link>
                <p className="text-xs text-slate-500">{item.patientId}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {item.metrics.map((metric, mIdx) =>
              <div
                key={mIdx}
                className={`rounded-xl border p-5 relative ${getSeverityColor(metric.severity)}`}>

                    {metric.severity !== 'moderate' &&
                <div className="absolute top-4 right-4 text-amber-500">
                        <AlertTriangleIcon className="h-5 w-5" />
                      </div>
                }

                    <Link
                  to={`/patients/${item.patientId}?field=${encodeURIComponent(metric.label)}`}
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 hover:text-blue-600 hover:underline cursor-pointer block w-fit">

                      {metric.label}
                    </Link>

                    <div className="flex items-baseline gap-2 mb-4">
                      <input
                    type="text"
                    readOnly
                    value={metric.currentValue}
                    className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-lg font-semibold text-slate-900 focus:outline-none" />

                      <span className="text-sm text-slate-500 font-medium">
                        {metric.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mr-4">
                        <div
                      className={`h-1.5 rounded-full ${getSeverityBg(metric.severity)}`}
                      style={{
                        width: `${metric.confidenceScore}%`
                      }}>
                    </div>
                      </div>
                      <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${getConfidenceBg(metric.confidenceScore)}`}>

                        {metric.confidenceScore}%
                      </span>
                    </div>

                    {metric.suggestedCorrection &&
                <div className="mt-4 p-3 bg-amber-50/50 rounded-lg flex items-center justify-between border border-amber-100/50">
                        <div className="text-sm">
                          <span className="text-slate-500">Suggested: </span>
                          <span className="font-semibold text-slate-900">
                            {metric.suggestedCorrection}
                          </span>
                        </div>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          Accept
                        </button>
                      </div>
                }
                  </div>
              )}
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Clinical Notes / Recommendations
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {item.recommendation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>);

}