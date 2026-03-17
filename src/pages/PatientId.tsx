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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto px-6 py-12"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{t.title}</h1>
        <p className="text-lg text-slate-600">{t.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <button 
          onClick={() => setMethod('scan')}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${method === 'scan' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
        >
          <ScanFace className={`w-12 h-12 mb-4 ${method === 'scan' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <h3 className="font-semibold text-slate-900 mb-2">{t.scan}</h3>
          <p className="text-sm text-slate-500">{t.scanDesc}</p>
        </button>

        <button 
          onClick={() => setMethod('card')}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${method === 'card' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
        >
          <CreditCard className={`w-12 h-12 mb-4 ${method === 'card' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <h3 className="font-semibold text-slate-900 mb-2">{t.card}</h3>
          <p className="text-sm text-slate-500">{t.cardDesc}</p>
        </button>

        <button 
          onClick={() => setMethod('manual')}
          className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${method === 'manual' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
        >
          <Keyboard className={`w-12 h-12 mb-4 ${method === 'manual' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <h3 className="font-semibold text-slate-900 mb-2">{t.manual}</h3>
          <p className="text-sm text-slate-500">{t.manualDesc}</p>
        </button>
      </div>

      {method && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
        >
          {isVerifying ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t.verifying}</h3>
              <p className="text-slate-500">{t.accessing}</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-100 p-6 rounded-full mb-6">
                {method === 'scan' && <ScanFace className="w-16 h-16 text-slate-600" />}
                {method === 'card' && <CreditCard className="w-16 h-16 text-slate-600" />}
                {method === 'manual' && <Keyboard className="w-16 h-16 text-slate-600" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {method === 'scan' && t.lookCamera}
                {method === 'card' && t.insertCard}
                {method === 'manual' && t.enterId}
              </h3>
              <p className="text-slate-600 mb-8 max-w-md">
                {t.demoText}
              </p>
              <button 
                onClick={handleSimulateVerification}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center transition-colors shadow-lg shadow-indigo-200"
              >
                {t.simulate} <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
