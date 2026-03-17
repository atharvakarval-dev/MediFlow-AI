import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation as NavIcon, ArrowRight, ArrowUp, ArrowLeft, ArrowDown, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { translations } from '../utils/translations';

export function Navigation() {
  const navigate = useNavigate();
  const { currentPatient, language } = useAppStore();
  const [step, setStep] = useState(0);

  const t = translations[language].navigation;

  const routeSteps = [
    { instruction: t.steps[0].instruction, icon: ArrowUp, distance: t.steps[0].distance },
    { instruction: t.steps[1].instruction, icon: ArrowLeft, distance: t.steps[1].distance },
    { instruction: t.steps[2].instruction, icon: ArrowUp, distance: t.steps[2].distance },
    { instruction: t.steps[3].instruction, icon: ArrowRight, distance: t.steps[3].distance },
  ];

  useEffect(() => {
    if (step < routeSteps.length) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, 3000); // Simulate walking
      return () => clearTimeout(timer);
    }
  }, [step, routeSteps.length]);

  if (!currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-slate-500 mb-4">No navigation data available.</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium">Return Home</button>
      </div>
    );
  }

  const isArrived = step >= routeSteps.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-6 py-8 md:py-12 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <NavIcon className="w-8 h-8 text-indigo-600" /> {t.title}
          </h1>
          <p className="text-slate-600">{t.guiding} {currentPatient.name} {t.to} {currentPatient.nextDestination}</p>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-8">
        {/* Map Placeholder */}
        <div className="bg-slate-200 rounded-3xl border-4 border-white shadow-xl overflow-hidden relative min-h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hospitalmap/800/600')] bg-cover bg-center opacity-50 mix-blend-multiply"></div>
          
          <div className="relative z-10 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl text-center max-w-xs w-full">
            {isArrived ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.arrived}</h2>
                <p className="text-slate-600">{t.wait} {currentPatient.assignedDoctor}.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-6 w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  {t.finish}
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  {(() => {
                    const CurrentIcon = routeSteps[step]?.icon;
                    return CurrentIcon ? <CurrentIcon className="w-10 h-10" /> : null;
                  })()}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{routeSteps[step]?.instruction}</h2>
                <p className="text-indigo-600 font-semibold text-lg">{routeSteps[step]?.distance}</p>
              </div>
            )}
          </div>
        </div>

        {/* Route Steps */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" /> {t.routeDetails}
          </h3>
          
          <div className="flex-1 relative">
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>
            
            <ul className="space-y-8 relative z-10">
              {routeSteps.map((routeStep, idx) => {
                const isCompleted = idx < step;
                const isCurrent = idx === step;
                const Icon = routeStep.icon;
                
                return (
                  <li key={idx} className={`flex items-start gap-6 transition-opacity duration-300 ${isCompleted ? 'opacity-50' : isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="pt-2">
                      <p className={`font-bold text-lg ${isCurrent ? 'text-indigo-900' : 'text-slate-700'}`}>{routeStep.instruction}</p>
                      <p className="text-slate-500 font-medium">{routeStep.distance}</p>
                    </div>
                  </li>
                );
              })}
              
              <li className={`flex items-start gap-6 transition-opacity duration-300 ${isArrived ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${isArrived ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="pt-2">
                  <p className={`font-bold text-lg ${isArrived ? 'text-emerald-700' : 'text-slate-700'}`}>{currentPatient.nextDestination}</p>
                  <p className="text-slate-500 font-medium">{t.finalDest}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
