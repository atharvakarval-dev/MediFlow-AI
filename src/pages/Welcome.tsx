import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Globe, UserPlus, Fingerprint, Shield, Zap, Clock, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { translations, Language } from '../utils/translations';

export function Welcome() {
  const navigate = useNavigate();
  const { setCurrentPatient, language, setLanguage } = useAppStore();
  const t = translations[language].welcome;

  const handleStart = () => {
    setCurrentPatient(null);
    navigate('/identify');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full p-4 lg:p-6 gap-6">
      {/* Left Panel - Vision & Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full lg:w-[55%] liquid-glass-strong rounded-[2.5rem] p-8 lg:p-12 flex flex-col min-h-[calc(100vh-10rem)] overflow-hidden group"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-16 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center liquid-glass shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-2xl tracking-tight text-white">MedFlow AI</span>
          </div>
          <div className="liquid-glass px-4 py-2 rounded-full flex items-center gap-2 text-sm text-white/80 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            HIPAA Compliant
          </div>
        </div>

        {/* Hero Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col justify-center items-start max-w-xl relative z-10"
        >
          
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-medium tracking-tight text-white leading-[1.1] mb-6">
            Intelligent <br/>
            <span className="font-serif italic text-white/80 font-light">healthcare</span> triage
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-white/60 mb-10 max-w-md leading-relaxed font-light">
            {t.subtitle}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            {['Voice Analysis', 'AI Routing', 'Real-time Priority'].map((tag, i) => (
              <div key={i} className="liquid-glass px-5 py-2.5 rounded-full text-xs font-medium text-white/80 border border-white/10 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-white/50" />
                {tag}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer Quote */}
        <div className="mt-auto pt-16 relative z-10">
          <p className="text-[10px] tracking-[0.2em] font-semibold uppercase text-white/40 mb-4">System Status</p>
          <p className="text-xl text-white/80 mb-6 font-light">
            "Providing <span className="font-serif italic text-white">seamless</span> care when it matters most."
          </p>
          <div className="flex items-center gap-4 opacity-60">
            <div className="h-px w-12 bg-gradient-to-r from-white/0 to-white/40"></div>
            <span className="text-[10px] tracking-[0.2em] font-semibold uppercase text-white">MedFlow AI</span>
            <div className="h-px w-12 bg-gradient-to-l from-white/0 to-white/40"></div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Actions */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="w-full lg:w-[45%] flex flex-col gap-6"
      >
        {/* Top Bar - Language Selector */}
        <div className="flex justify-end">
          <div className="liquid-glass rounded-full p-1.5 flex items-center gap-1 border border-white/10">
            <div className="px-3 py-1.5 flex items-center gap-2 text-white/50">
              <Globe className="w-4 h-4" />
            </div>
            {(['en', 'es', 'fr', 'hi', 'ta'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  language === lang 
                    ? 'bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex flex-col justify-center gap-6 max-w-xl mx-auto w-full">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-medium text-white mb-3 tracking-tight">Welcome</h2>
            <p className="text-white/60 font-light text-lg">Please select how you would like to proceed.</p>
          </div>

          <button 
            onClick={handleStart}
            className="group w-full rounded-[2.5rem] p-6 sm:p-8 flex items-center gap-6 text-left transition-all duration-500 relative overflow-hidden border border-white bg-white hover:bg-gray-100 shadow-[0_8px_32px_rgba(255,255,255,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-black/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/5 flex items-center justify-center shrink-0 border border-black/10 group-hover:scale-110 transition-transform duration-500 shadow-inner relative z-10">
              <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-medium text-black mb-2 tracking-tight">{t.newPatient}</h3>
              <p className="text-black/70 font-light text-sm sm:text-base leading-relaxed pr-4">{t.newPatientDesc}</p>
            </div>
            
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black flex items-center justify-center shrink-0 border border-black group-hover:bg-black/80 transition-colors duration-500 group-hover:translate-x-1 relative z-10">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </button>

          <button 
            onClick={handleStart}
            className="group w-full rounded-[2.5rem] p-6 sm:p-8 flex items-center gap-6 text-left transition-all duration-500 relative overflow-hidden border border-white/30 liquid-glass hover:bg-white/20 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
              <Fingerprint className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 relative z-10">
              <h3 className="text-2xl sm:text-3xl font-medium text-white mb-2 tracking-tight">{t.returningPatient}</h3>
              <p className="text-white/70 font-light text-sm sm:text-base leading-relaxed pr-4">{t.returningPatientDesc}</p>
            </div>
            
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white/20 transition-colors duration-500 group-hover:translate-x-1 relative z-10">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </button>
        </div>

        {/* Bottom Status Widget */}
        <div className="liquid-glass rounded-3xl p-6 flex items-center justify-between border border-white/10 mt-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center liquid-glass">
               <Clock className="w-5 h-5 text-white/70" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Average Wait Time</h3>
              <p className="text-xs text-white/50 font-light">&lt; 2 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-white/70">AI Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
