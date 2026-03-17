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
        <p className="text-white/60 mb-4">No patient data available.</p>
        <button onClick={() => navigate('/')} className="text-white font-medium hover:underline">Return Home</button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-white/20 text-white border-white/30';
      case 'High': return 'bg-white/15 text-white border-white/20';
      case 'Medium': return 'bg-white/10 text-white border-white/10';
      case 'Low': return 'bg-white/5 text-white/80 border-white/5';
      default: return 'bg-white/5 text-white/80 border-white/5';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-6xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 liquid-glass-strong p-10 rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-white/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-medium text-white mb-3 tracking-tight">{t.title}</h1>
          <p className="text-lg sm:text-xl text-white/60 font-serif italic font-light">{t.subtitle} <span className="text-white/90 font-medium not-italic ml-1">{currentPatient.name}</span></p>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10">
          {currentPatient.severity && (
            <div className={`px-6 py-3 rounded-full border border-white/20 font-medium text-sm flex items-center gap-2 liquid-glass text-white shadow-lg backdrop-blur-md`}>
              <Activity className="w-4 h-4" strokeWidth={2} />
              {translations[language].intake[`severity${currentPatient.severity}` as keyof typeof translations[typeof language]['intake']] || currentPatient.severity}
            </div>
          )}
          <div className={`px-6 py-3 rounded-full border font-medium text-sm flex items-center gap-2 shadow-lg backdrop-blur-md ${getPriorityColor(currentPatient.priority)}`}>
            <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            {t.priority}: {translations[language].triage[`priority${currentPatient.priority}` as keyof typeof translations[typeof language]['triage']] || currentPatient.priority}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-white/5 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <Activity className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-medium text-white tracking-tight">{t.symptoms}</h2>
              </div>
              <div className="flex flex-wrap gap-3 mb-10">
                {currentPatient.symptoms.map((symptom, idx) => (
                  <span key={idx} className="liquid-glass px-5 py-2.5 rounded-full text-sm font-medium text-white/90 border border-white/10 shadow-sm">
                    {symptom}
                  </span>
                ))}
              </div>
              <div className="mt-8 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> {t.transcript}
                </h3>
                <p className="text-white/80 italic font-serif text-lg leading-relaxed">
                  "{currentPatient.transcript}"
                </p>
              </div>
            </div>
          </div>

          <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <Stethoscope className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-medium text-white tracking-tight">{t.actionPlan}</h2>
              </div>
              <ul className="space-y-5">
                {currentPatient.recommendedTests.map((test, idx) => (
                  <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <CheckCircle2 className="w-4 h-4 text-white/80" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="font-medium text-white text-lg block mb-1 tracking-tight">{test}</span>
                      <span className="text-sm text-white/50 font-light">{t.requiredFor}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-8 h-full">
          <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-white/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-2xl font-medium mb-8 flex items-center gap-3 text-white tracking-tight">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <MapPin className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                {t.nextDest}
              </h2>
              
              <div className="liquid-glass p-8 rounded-[2rem] mb-10 flex-1 border border-white/10 shadow-inner flex flex-col justify-center">
                <p className="text-white/50 text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" /> {t.proceedTo}
                </p>
                <p className="text-4xl font-medium text-white mb-6 tracking-tight leading-tight">{currentPatient.nextDestination}</p>
                
                <div className="h-px w-full bg-white/10 mb-6"></div>
                
                <div>
                  <p className="text-white/50 text-xs tracking-widest uppercase mb-2">{t.assignedTo}</p>
                  <p className="font-medium text-white text-xl tracking-tight">{currentPatient.assignedDoctor}</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/navigate')}
                className="group w-full bg-white hover:bg-gray-100 text-black px-8 py-5 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-all duration-500 hover:scale-105 mt-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {t.startNav} 
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:translate-x-1 transition-transform duration-500">
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
