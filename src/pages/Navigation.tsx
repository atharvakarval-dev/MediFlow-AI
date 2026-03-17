import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation as NavIcon, ArrowRight, ArrowUp, ArrowLeft, Check } from 'lucide-react';
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
        <p className="text-white/60 mb-4">No navigation data available.</p>
        <button onClick={() => navigate('/')} className="text-white font-medium hover:underline">Return Home</button>
      </div>
    );
  }

  const isArrived = step >= routeSteps.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-white tracking-tight flex items-center gap-3">
            <NavIcon className="w-6 h-6 text-white/50" strokeWidth={1.5} />
            {t.title}
          </h1>
          <p className="text-white/50 font-light mt-1">
            {t.guiding} <span className="text-white/90 font-medium">{currentPatient.name}</span> {t.to} <span className="text-white/90 font-medium">{currentPatient.nextDestination}</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel - Live Map / Status */}
        <div className="lg:col-span-7 liquid-glass-strong rounded-[2rem] border border-white/10 overflow-hidden relative flex flex-col items-center justify-center min-h-[400px]">
          {/* Atmospheric Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
          
          {/* Glowing Orb */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${isArrived ? 'bg-emerald-500/10' : 'bg-white/5'}`}></div>

          <div className="relative z-10 flex flex-col items-center text-center p-8 w-full max-w-md">
            <AnimatePresence mode="wait">
              {isArrived ? (
                <motion.div 
                  key="arrived"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center w-full"
                >
                <div className="w-32 h-32 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-[-20px] rounded-full border border-emerald-500/10"></div>
                  <Check className="w-14 h-14 text-emerald-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4 tracking-tight">{t.arrived}</h2>
                <p className="text-white/60 text-lg font-light leading-relaxed mb-10">
                  {t.wait} <span className="text-white font-medium">{currentPatient.assignedDoctor}</span>.
                </p>
                <button 
                  onClick={() => {
                    if (currentPatient) {
                      useAppStore.getState().addPatientToQueue(currentPatient);
                    }
                    navigate('/');
                  }}
                  className="w-full bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  {t.finish}
                </button>
              </motion.div>
              ) : (
                <motion.div 
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
                    <motion.div 
                      animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-white/20"
                    />
                    <div className="absolute inset-[-20px] rounded-full border border-white/5"></div>
                    {(() => {
                      const CurrentIcon = routeSteps[step]?.icon;
                      return CurrentIcon ? <CurrentIcon className="w-14 h-14 text-white relative z-10" strokeWidth={1.5} /> : null;
                    })()}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-medium text-white mb-6 tracking-tight leading-tight">
                    {routeSteps[step]?.instruction}
                  </h2>
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    <p className="text-white/80 font-mono text-sm tracking-widest uppercase">{routeSteps[step]?.distance}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel - Route Details */}
        <div className="lg:col-span-5 liquid-glass-strong rounded-[2rem] border border-white/10 p-8 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <MapPin className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-medium text-white tracking-tight">{t.routeDetails}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4 relative z-10 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            <ul className="relative">
              {routeSteps.map((routeStep, idx) => {
                const isCompleted = idx < step;
                const isCurrent = idx === step;
                const Icon = routeStep.icon;
                
                return (
                  <li key={idx} className="relative flex gap-6 pb-12">
                    {/* Connecting Line - perfectly aligned to start at bottom of circle and end at top of next circle */}
                    <div className={`absolute left-[19px] top-[40px] bottom-0 w-[2px] transition-colors duration-500 ${isCompleted ? 'bg-white/20' : 'bg-white/5'}`}></div>
                    
                    {/* Icon Node */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ${
                        isCompleted ? 'bg-white/5 border-white/20 text-white/60' : 
                        isCurrent ? 'bg-white border-white text-black ring-4 ring-white/10' : 
                        'bg-black/20 border-white/10 text-white/30'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5" strokeWidth={2} /> : <Icon className="w-5 h-5" strokeWidth={isCurrent ? 2 : 1.5} />}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className={`pt-1.5 flex-1 transition-all duration-500 ${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-40'}`}>
                      <h4 className={`text-lg font-medium tracking-tight mb-1 ${isCurrent ? 'text-white' : 'text-white/80'}`}>
                        {routeStep.instruction}
                      </h4>
                      <p className="text-[11px] font-mono tracking-widest text-white/50 uppercase">{routeStep.distance}</p>
                    </div>
                  </li>
                );
              })}
              
              {/* Final Destination Node */}
              <li className="relative flex gap-6">
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ${
                    isArrived ? 'bg-emerald-500 border-emerald-400 text-black ring-4 ring-emerald-500/20' : 'bg-black/20 border-white/10 text-white/30'
                  }`}>
                    <MapPin className="w-5 h-5" strokeWidth={isArrived ? 2 : 1.5} />
                  </div>
                </div>
                <div className={`pt-1.5 flex-1 transition-all duration-500 ${isArrived ? 'opacity-100' : 'opacity-40'}`}>
                  <h4 className={`text-lg font-medium tracking-tight mb-1 ${isArrived ? 'text-white' : 'text-white/80'}`}>
                    {currentPatient.nextDestination}
                  </h4>
                  <p className="text-[11px] font-mono tracking-widest text-white/50 uppercase">{t.finalDest}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
