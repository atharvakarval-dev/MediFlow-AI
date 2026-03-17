import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Stethoscope, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { translations } from '../utils/translations';

export function Triage() {
  const navigate = useNavigate();
  const { currentPatient, language } = useAppStore();
  const t = translations[language].triage;

  if (!currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-slate-500 mb-4">No patient data available.</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium">Return Home</button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{t.title}</h1>
          <p className="text-lg text-slate-600">{t.subtitle} {currentPatient.name}</p>
        </div>
        <div className="flex gap-3">
          {currentPatient.severity && (
            <div className={`px-6 py-3 rounded-full border-2 font-bold text-lg flex items-center gap-2 bg-slate-100 text-slate-700 border-slate-200`}>
              <Activity className="w-5 h-5" />
              {translations[language].intake[`severity${currentPatient.severity}` as keyof typeof translations[typeof language]['intake']] || currentPatient.severity}
            </div>
          )}
          <div className={`px-6 py-3 rounded-full border-2 font-bold text-lg flex items-center gap-2 ${getPriorityColor(currentPatient.priority)}`}>
            <AlertTriangle className="w-5 h-5" />
            {t.priority}: {translations[language].triage[`priority${currentPatient.priority}` as keyof typeof translations[typeof language]['triage']] || currentPatient.priority}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <Activity className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-900">{t.symptoms}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {currentPatient.symptoms.map((symptom, idx) => (
                <span key={idx} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium border border-indigo-100">
                  {symptom}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.transcript}</h3>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                "{currentPatient.transcript}"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <Stethoscope className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900">{t.actionPlan}</h2>
            </div>
            <ul className="space-y-4">
              {currentPatient.recommendedTests.map((test, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">{test}</span>
                    <span className="text-sm text-slate-500">{t.requiredFor}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" /> {t.nextDest}
            </h2>
            <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm mb-8">
              <p className="text-indigo-200 text-sm font-medium mb-1">{t.proceedTo}</p>
              <p className="text-3xl font-bold text-white mb-2">{currentPatient.nextDestination}</p>
              <p className="text-slate-300 text-sm">{t.assignedTo}: {currentPatient.assignedDoctor}</p>
            </div>
            <button 
              onClick={() => navigate('/navigate')}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {t.startNav} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
