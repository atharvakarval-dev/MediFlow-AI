import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, UserPlus, Fingerprint } from 'lucide-react';
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] relative"
    >
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
        <Globe className="w-4 h-4 text-slate-500" />
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="ta">தமிழ் (Tamil)</option>
        </select>
      </div>

      <div className="text-center mb-12 mt-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          {t.title} <span className="text-indigo-600">MedFlow AI</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button 
          onClick={handleStart}
          className="group relative bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-indigo-600 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="bg-indigo-50 p-4 rounded-full mb-6 group-hover:bg-indigo-100 transition-colors">
            <UserPlus className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.newPatient}</h2>
          <p className="text-slate-500 mb-6">{t.newPatientDesc}</p>
          <div className="mt-auto flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
            {t.getStarted} <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </button>

        <button 
          onClick={handleStart}
          className="group relative bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-emerald-600 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="bg-emerald-50 p-4 rounded-full mb-6 group-hover:bg-emerald-100 transition-colors">
            <Fingerprint className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.returningPatient}</h2>
          <p className="text-slate-500 mb-6">{t.returningPatientDesc}</p>
          <div className="mt-auto flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform">
            {t.verifyIdentity} <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </button>
      </div>

      <div className="mt-16 flex items-center gap-4 text-slate-500 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
        <Globe className="w-5 h-5" />
        <span className="font-medium">{t.availableLanguages}</span>
      </div>
    </motion.div>
  );
}
