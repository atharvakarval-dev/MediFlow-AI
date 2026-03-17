import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Stethoscope, ArrowRight, CircleCheck, MapPin, Quote } from 'lucide-react';
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
    <div 
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
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Activity className="w-6 h-6 text-blue-400" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-medium text-white tracking-tight">{t.symptoms}</h2>
              </div>
              <div className="flex flex-wrap gap-3 mb-10">
                {currentPatient.symptoms.map((symptom, idx) => (
                  <span key={idx} className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors px-5 py-2.5 rounded-full text-sm font-medium text-white/90 border border-white/10 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                    {symptom}
                  </span>
                ))}
              </div>
              
              {/* Transcript Section */}
              <div className="mt-8 relative">
                <div className="absolute -left-px top-8 bottom-8 w-1 bg-gradient-to-b from-blue-500/50 to-transparent rounded-full"></div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl border border-white/10 shadow-inner relative overflow-hidden ml-4">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Quote className="w-32 h-32" />
                  </div>
                  <h3 className="text-xs font-medium text-blue-300/80 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <Quote className="w-4 h-4" /> {t.transcript}
                  </h3>
                  <p className="text-white/90 italic font-serif text-xl leading-relaxed relative z-10">
                    "{currentPatient.transcript}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Stethoscope className="w-6 h-6 text-emerald-400" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-medium text-white tracking-tight">{t.actionPlan}</h2>
              </div>
              <ul className="space-y-4">
                {currentPatient.recommendedTests.map((test, idx) => (
                  <li key={idx} className="group flex items-start gap-5 p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20 shadow-sm hover:shadow-md">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                      <CircleCheck className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-white text-lg block mb-1.5 tracking-tight group-hover:text-emerald-50 transition-colors">{test}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-px w-4 bg-white/20 group-hover:bg-emerald-500/40 transition-colors"></div>
                        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{t.requiredFor}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-fit sticky top-8">
          <div className="liquid-glass-strong rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10 shrink-0">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <MapPin className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-medium text-white tracking-tight">{t.nextDest}</h2>
              </div>
              
              {/* Main Content Area */}
              <div className="flex flex-col gap-10">
                
                {/* Destination */}
                <div>
                  <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-4 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5" /> {t.proceedTo}
                  </p>
                  <p className="text-3xl sm:text-4xl font-medium text-white tracking-tight leading-tight">
                    {currentPatient.nextDestination}
                  </p>
                </div>
                
                {/* Separator */}
                <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent"></div>
                
                {/* Assignment & Details */}
                <div className="space-y-8">
                  {/* Doctor */}
                  <div>
                    <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-4">{t.assignedTo}</p>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
                        <span className="text-white font-medium text-xl">
                          {currentPatient.assignedDoctor.replace('Dr. ', '').charAt(0)}
                        </span>
                      </div>
                      <p className="font-medium text-white text-xl tracking-tight leading-snug">{currentPatient.assignedDoctor}</p>
                    </div>
                  </div>
                  
                  {/* ID and Wait Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="liquid-glass p-5 rounded-3xl border border-white/10 flex flex-col justify-center">
                      <p className="text-white/50 text-[10px] uppercase font-medium tracking-wider mb-2">{t.patientId}</p>
                      <p className="font-medium text-white/90 text-sm tracking-widest">{currentPatient.id}</p>
                    </div>
                    
                    <div className="liquid-glass p-5 rounded-3xl border border-white/10 flex flex-col justify-center">
                      <p className="text-white/50 text-[10px] uppercase font-medium tracking-wider mb-2">{t.estWaitTime}</p>
                      <div className="font-medium text-emerald-400 text-sm tracking-tight flex items-center gap-2.5">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>~15 mins</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
              
              {/* Button */}
              <button 
                onClick={() => navigate('/navigate')}
                className="group w-full bg-white hover:bg-gray-100 text-black px-8 py-5 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] mt-10 shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
              >
                <span>{t.startNav}</span>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
