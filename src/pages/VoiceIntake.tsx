import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Volume2, AlertCircle, PlayCircle, Activity } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { translations } from '../utils/translations';
import { allocateDoctor } from '../utils/doctorAllocation';
import { GoogleGenAI, Type } from '@google/genai';

type Severity = 'Mild' | 'Moderate' | 'Severe';

// Extend window type for cross-browser SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function VoiceIntake() {
  const navigate = useNavigate();
  const { updatePatient, language, patientsQueue } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [showSeveritySelection, setShowSeveritySelection] = useState(false);

  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);
  const interimRef = useRef('');

  const t = translations[language].intake;
  const simulateSpeech = t.simulatedSpeech;

  useEffect(() => {
    if (!SpeechRecognition) setBrowserSupported(false);
  }, []);

  const handleStartRecording = () => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'en-US';

    interimRef.current = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = interimRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
          interimRef.current = final;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript((final + interim).trim());
    };

    recognition.onend = () => {
      const finalText = interimRef.current.trim();
      setTranscript(finalText || '');
      setConfidence(finalText ? 95 : null);
      setIsRecording(false);
      setShowSeveritySelection(!!finalText);
    };

    recognition.onerror = (event: any) => {
      console.error('SpeechRecognition error:', event.error);
      setIsRecording(false);
      setShowSeveritySelection(!!interimRef.current.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setShowPrompt(false);
    setTranscript('Listening...');
    setConfidence(null);
    setShowSeveritySelection(false);
  };

  const handleSimulateRecording = () => {
    setIsRecording(true);
    setShowPrompt(false);
    setTranscript('');
    setConfidence(null);
    setShowSeveritySelection(false);

    let i = 0;
    const interval = setInterval(() => {
      setTranscript(simulateSpeech.substring(0, i));
      i++;
      if (i > simulateSpeech.length) {
        clearInterval(interval);
        setConfidence(98);
        setIsRecording(false);
        setShowSeveritySelection(true);
      }
    }, 50);
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSeveritySelect = async (severity: Severity) => {
    setShowSeveritySelection(false);
    setIsProcessing(true);

    const finalTranscript = transcript || simulateSpeech;

    try {
      // Use Gemini to extract symptoms and tests
      // @ts-ignore
      const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following patient transcript and extract the symptoms, recommended medical tests, and the most appropriate medical specialty.
        Available specialties: General Physician, Cardiologist, Neurologist, Gastroenterologist, Orthopedic, Dermatologist, ENT Specialist, Pediatrician.
        Transcript: "${finalTranscript}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              symptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of symptoms extracted from the transcript"
              },
              recommendedTests: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of recommended medical tests based on the symptoms"
              },
              suggestedSpecialty: {
                type: Type.STRING,
                description: "The most appropriate medical specialty from the provided list."
              }
            },
            required: ["symptoms", "recommendedTests", "suggestedSpecialty"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      const extractedSymptoms = result.symptoms || t.symptoms;
      const extractedTests = result.recommendedTests || t.tests;
      const suggestedSpecialty = result.suggestedSpecialty;

      // Base priority on severity
      let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
      if (severity === 'Severe') priority = 'Critical';
      else if (severity === 'Moderate') priority = 'High';
      else priority = 'Low';
      
      const allocation = allocateDoctor(extractedSymptoms, priority, patientsQueue, severity, finalTranscript, suggestedSpecialty);
      
      updatePatient({
        transcript: finalTranscript,
        symptoms: extractedSymptoms,
        recommendedTests: extractedTests,
        priority: priority,
        severity: severity,
        assignedDoctor: `${allocation.doctor.name} (${allocation.doctor.specialty})`,
        nextDestination: allocation.doctor.room
      });
      navigate('/triage');
    } catch (error) {
      console.error("Error analyzing transcript:", error);
      // Fallback to basic keyword matching if API fails
      let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
      if (severity === 'Severe') priority = 'Critical';
      else if (severity === 'Moderate') priority = 'High';
      else priority = 'Low';
      
      // Use the transcript as a single "symptom" string so allocateDoctor can do keyword matching on it
      const fallbackSymptoms = [finalTranscript];
      const allocation = allocateDoctor(fallbackSymptoms, priority, patientsQueue, severity, finalTranscript);
      
      updatePatient({
        transcript: finalTranscript,
        symptoms: ["Symptoms extracted from transcript"],
        recommendedTests: ["Basic Vitals Check", "Doctor Consultation"],
        priority: priority,
        severity: severity,
        assignedDoctor: `${allocation.doctor.name} (${allocation.doctor.specialty})`,
        nextDestination: allocation.doctor.room
      });
      navigate('/triage');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]"
    >
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-medium text-white mb-4 tracking-tight">{t.title}</h1>
        <p className="text-lg sm:text-xl text-white/60 font-serif italic font-light">{t.subtitle}</p>
      </div>

      <div className="relative w-full max-w-3xl liquid-glass-strong rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>

        {isRecording && (
          <div className="absolute inset-0 bg-white/5 rounded-[2.5rem] animate-pulse -z-10"></div>
        )}

        <div className="mb-10 relative z-10">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner border ${isRecording ? 'bg-white/20 border-white/30 scale-110 shadow-[0_0_40px_rgba(255,255,255,0.2)]' : 'bg-white/10 border-white/10'}`}>
            {isRecording ? (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-48 h-48 border-4 border-white/20 rounded-full animate-ping opacity-75"></div>
                <div className="absolute w-40 h-40 border-4 border-white/30 rounded-full animate-pulse"></div>
                <Mic className="w-14 h-14 text-white relative z-10" strokeWidth={1.5} />
              </div>
            ) : (
              <Mic className="w-14 h-14 text-white/60" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {!browserSupported && (
          <div className="w-full mb-6 p-5 liquid-glass rounded-2xl flex items-start gap-3 text-white/80 border border-white/10 relative z-10">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-white/80" strokeWidth={1.5} />
            <p className="text-base font-light leading-relaxed">{t.notSupported}</p>
          </div>
        )}

        <div className="w-full min-h-[140px] liquid-glass rounded-3xl p-8 mb-10 relative z-10 border border-white/10 shadow-inner">
          {showPrompt ? (
            <p className="text-white/50 text-center italic text-xl flex items-center justify-center gap-3 font-serif h-full">
              <Volume2 className="w-6 h-6" strokeWidth={1.5} /> {t.prompt}
            </p>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <p className="text-white/90 text-xl leading-relaxed font-light tracking-wide">
                {transcript}
                {isRecording && <span className="inline-block w-2.5 h-6 bg-white/60 ml-2 animate-pulse align-middle"></span>}
              </p>
              
              {confidence !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex items-center gap-3 text-sm font-medium border-t border-white/10 pt-5"
                >
                  <span className="text-white/50 uppercase tracking-widest text-xs">{t.confidenceScore}</span>
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1 border ${
                    confidence > 80 ? 'bg-white/20 text-white border-white/30' : 
                    confidence > 60 ? 'bg-white/10 text-white/80 border-white/20' : 
                    'bg-white/5 text-white/60 border-white/10'
                  }`}>
                    {confidence}%
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full relative z-10">
          {!isRecording && !isProcessing && !showSeveritySelection && (
            <>
              {browserSupported && (
                <button 
                  onClick={handleStartRecording}
                  className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black px-10 py-5 rounded-full font-medium text-lg transition-all duration-500 flex items-center justify-center gap-3 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <Mic className="w-6 h-6 text-black" strokeWidth={1.5} /> {t.start}
                </button>
              )}
              <button 
                onClick={handleSimulateRecording}
                className={`w-full sm:w-auto px-10 py-5 rounded-full font-medium text-lg transition-all duration-500 flex items-center justify-center gap-3 hover:scale-105 border ${
                  browserSupported 
                    ? 'liquid-glass text-white/80 hover:text-white hover:bg-white/20 border-white/10 hover:border-white/20' 
                    : 'liquid-glass hover:bg-white/20 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}
              >
                <PlayCircle className="w-6 h-6" strokeWidth={1.5} /> {t.simulateBtn}
              </button>
            </>
          )}

          {isRecording && !isProcessing && !showSeveritySelection && (
            <button 
              onClick={handleStopRecording}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-red-600 px-12 py-5 rounded-full font-medium text-lg transition-all duration-500 flex items-center justify-center gap-3 animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <Square className="w-6 h-6 fill-current" strokeWidth={1.5} /> {t.stop}
            </button>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mb-5 text-white/80" strokeWidth={1.5} />
              <p className="font-medium text-xl tracking-tight">{t.analyzing}</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showSeveritySelection && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mt-10 pt-10 border-t border-white/10 relative z-10"
            >
              <h3 className="text-xl font-medium text-white mb-8 text-center flex items-center justify-center gap-3 tracking-tight">
                <Activity className="w-6 h-6 text-white/60" strokeWidth={1.5} />
                {t.severityPrompt || "How severe are your symptoms right now?"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <button 
                  onClick={() => handleSeveritySelect('Mild')}
                  className="group p-6 rounded-[2rem] liquid-glass hover:bg-white/20 text-white transition-all duration-500 border border-white/10 hover:border-white/30 hover:scale-105 shadow-xl flex flex-col items-center text-center"
                >
                  <span className="text-lg font-medium tracking-tight mb-2">{t.severityMild || "Mild"}</span>
                  <span className="text-sm font-light text-white/60">{t.severityMildDesc || "Can wait"}</span>
                </button>
                <button 
                  onClick={() => handleSeveritySelect('Moderate')}
                  className="group p-6 rounded-[2rem] liquid-glass hover:bg-white/20 text-white transition-all duration-500 border border-white/10 hover:border-white/30 hover:scale-105 shadow-xl flex flex-col items-center text-center"
                >
                  <span className="text-lg font-medium tracking-tight mb-2">{t.severityModerate || "Moderate"}</span>
                  <span className="text-sm font-light text-white/60">{t.severityModerateDesc || "Needs attention"}</span>
                </button>
                <button 
                  onClick={() => handleSeveritySelect('Severe')}
                  className="group p-6 rounded-[2rem] liquid-glass hover:bg-white/20 text-white transition-all duration-500 border border-white/10 hover:border-white/30 hover:scale-105 shadow-[0_8px_32px_rgba(255,255,255,0.1)] flex flex-col items-center text-center"
                >
                  <span className="text-lg font-medium tracking-tight mb-2">{t.severitySevere || "Severe"}</span>
                  <span className="text-sm font-light text-white/60">{t.severitySevereDesc || "Urgent care"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
