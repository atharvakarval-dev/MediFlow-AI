import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanFace, CreditCard, Keyboard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { translations } from '../utils/translations';

export function PatientId() {
  const navigate = useNavigate();
  const { setCurrentPatient, language } = useAppStore();
  const [method, setMethod] = useState<'scan' | 'card' | 'manual' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const t = translations[language].identify;

  const handleSimulateVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setCurrentPatient({
        id: 'P-' + Math.floor(Math.random() * 10000),
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        language: language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English',
        symptoms: [],
        transcript: '',
        recommendedTests: [],
        assignedDoctor: '',
        priority: 'Medium',
        currentLocation: 'Reception',
        nextDestination: 'Triage Kiosk'
      });
      navigate('/intake');
    }, 1500);
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
    <motion.div 
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
      variants={containerVariants}
      className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]"
    >
      <motion.div variants={itemVariants} className="mb-12 text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-medium text-white mb-4 tracking-tight">{t.title}</h1>
        <p className="text-lg sm:text-xl text-white/60 font-serif italic font-light">{t.subtitle}</p>
      </motion.div>

      <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-6 w-full mb-12">
        <button 
          onClick={() => setMethod('scan')}
          className={`group p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 relative overflow-hidden border ${method === 'scan' ? 'bg-white/20 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] scale-105' : 'liquid-glass hover:bg-black/50 shadow-xl'} backdrop-blur-md`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/5 to-white/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out"></div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 shadow-inner border ${method === 'scan' ? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/10'}`}>
            <ScanFace className={`w-10 h-10 ${method === 'scan' ? 'text-white' : 'text-white/80 group-hover:text-white'}`} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{t.scan}</h3>
          <p className="text-sm text-white/60 font-light leading-relaxed">{t.scanDesc}</p>
        </button>

        <button 
          onClick={() => setMethod('card')}
          className={`group p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 relative overflow-hidden border ${method === 'card' ? 'bg-white/20 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] scale-105' : 'liquid-glass hover:bg-black/50 shadow-xl'} backdrop-blur-md`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/5 to-white/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out"></div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 shadow-inner border ${method === 'card' ? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/10'}`}>
            <CreditCard className={`w-10 h-10 ${method === 'card' ? 'text-white' : 'text-white/80 group-hover:text-white'}`} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{t.card}</h3>
          <p className="text-sm text-white/60 font-light leading-relaxed">{t.cardDesc}</p>
        </button>

        <button 
          onClick={() => setMethod('manual')}
          className={`group p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 relative overflow-hidden border ${method === 'manual' ? 'bg-white/20 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] scale-105' : 'liquid-glass hover:bg-black/50 shadow-xl'} backdrop-blur-md`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/5 to-white/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out"></div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 shadow-inner border ${method === 'manual' ? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/10'}`}>
            <Keyboard className={`w-10 h-10 ${method === 'manual' ? 'text-white' : 'text-white/80 group-hover:text-white'}`} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{t.manual}</h3>
          <p className="text-sm text-white/60 font-light leading-relaxed">{t.manualDesc}</p>
        </button>
      </motion.div>

      {method && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl liquid-glass-strong p-10 rounded-[2.5rem] flex flex-col items-center text-center border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>

          {isVerifying ? (
            <div className="flex flex-col items-center relative z-10">
              <div className="w-20 h-20 border-4 border-white/10 border-t-white/80 rounded-full animate-spin mb-8 shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
              <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">{t.verifying}</h3>
              <p className="text-white/60 font-light text-lg">{t.accessing}</p>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-inner">
                {method === 'scan' && <ScanFace className="w-12 h-12 text-white" strokeWidth={1.5} />}
                {method === 'card' && <CreditCard className="w-12 h-12 text-white" strokeWidth={1.5} />}
                {method === 'manual' && <Keyboard className="w-12 h-12 text-white" strokeWidth={1.5} />}
              </div>
              <h3 className="text-3xl font-medium text-white mb-4 tracking-tight">
                {method === 'scan' && t.lookCamera}
                {method === 'card' && t.insertCard}
                {method === 'manual' && t.enterId}
              </h3>
              <p className="text-white/60 mb-10 max-w-md font-light text-lg leading-relaxed">
                {t.demoText}
              </p>
              <button 
                onClick={handleSimulateVerification}
                className="group bg-white hover:bg-gray-100 text-black px-10 py-5 rounded-full font-medium text-lg flex items-center transition-all duration-500 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {t.simulate} 
                <div className="ml-3 w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:translate-x-1 transition-transform duration-500">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
