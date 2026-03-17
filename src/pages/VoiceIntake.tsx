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
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 relative py-8">
      
      {/* Glassmorphic Container */}
      <div className="w-full max-w-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className={`w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-1000 ${isRecording ? 'bg-white/10 scale-110' : 'bg-white/5 scale-100'}`}></div>
        </div>

        <div className="text-center mb-10 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-medium text-white mb-3 tracking-tight">{t.title}</h1>
          <p className="text-base sm:text-lg text-white/50 font-light">{t.subtitle}</p>
        </div>

        {!browserSupported && (
          <div className="w-full max-w-md mb-8 p-4 bg-red-500/10 rounded-2xl flex items-start gap-3 text-red-200 border border-red-500/20 relative z-10">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm font-medium leading-relaxed">{t.notSupported}</p>
          </div>
        )}

        {/* Main Interaction Area */}
        <div className="w-full flex flex-col items-center relative z-10">
        
        {/* Mic / Recording Indicator */}
        <div className="mb-12 relative">
          <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-700 border ${
            isRecording 
              ? 'bg-white/10 border-white/30 shadow-[0_0_60px_rgba(255,255,255,0.15)] scale-105' 
              : 'bg-black/20 border-white/10 shadow-inner hover:bg-white/5'
          }`}>
            {isRecording ? (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-48 h-48 sm:w-56 sm:h-56 border border-white/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute w-40 h-40 sm:w-48 sm:h-48 border border-white/10 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] delay-300"></div>
                <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white relative z-10" strokeWidth={1} />
              </div>
            ) : (
              <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white/40" strokeWidth={1} />
            )}
          </div>
        </div>

        {/* Transcript Display */}
        <div className="w-full min-h-[120px] flex flex-col items-center justify-center mb-12">
          {showPrompt ? (
            <p className="text-white/40 text-center italic text-xl sm:text-2xl flex items-center justify-center gap-3 font-serif font-light">
              <Volume2 className="w-6 h-6 opacity-50" strokeWidth={1.5} /> {t.prompt}
            </p>
          ) : (
            <div className="flex flex-col items-center w-full">
              <p className="text-white text-2xl sm:text-3xl leading-relaxed font-serif font-light text-center max-w-2xl">
                {transcript}
                {isRecording && <span className="inline-block w-3 h-8 bg-white/40 ml-2 animate-pulse align-middle"></span>}
              </p>
              
              {confidence !== null && !isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex items-center gap-2 text-xs font-medium"
                >
                  <span className="text-white/40 uppercase tracking-widest">{t.confidenceScore}</span>
                  <div className={`px-2.5 py-1 rounded-md flex items-center gap-1 border ${
                    confidence > 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    confidence > 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-white/5 text-white/60 border-white/10'
                  }`}>
                    {confidence}%
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {!isRecording && !isProcessing && !showSeveritySelection && (
            <>
              {browserSupported && (
                <button 
                  onClick={handleStartRecording}
                  className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-medium text-base transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  <Mic className="w-5 h-5" strokeWidth={2} /> {t.start}
                </button>
              )}
              <button 
                onClick={handleSimulateRecording}
                className={`w-full sm:w-auto px-8 py-4 rounded-full font-medium text-base transition-all duration-300 flex items-center justify-center gap-2 border ${
                  browserSupported 
                    ? 'bg-black/20 text-white/80 hover:text-white hover:bg-white/10 border-white/10' 
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <PlayCircle className="w-5 h-5" strokeWidth={2} /> {t.simulateBtn}
              </button>
            </>
          )}

          {isRecording && !isProcessing && !showSeveritySelection && (
            <button 
              onClick={handleStopRecording}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-red-600 px-10 py-4 rounded-full font-medium text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Square className="w-5 h-5 fill-current" strokeWidth={2} /> {t.stop}
            </button>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center text-white/80">
              <Loader2 className="w-8 h-8 animate-spin mb-3" strokeWidth={2} />
              <p className="font-medium text-sm tracking-widest uppercase">{t.analyzing}</p>
            </div>
          )}
        </div>

        {/* Severity Selection */}
        <AnimatePresence>
          {showSeveritySelection && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full mt-8"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20"></div>
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" strokeWidth={2} />
                  {t.severityPrompt || "Select Severity"}
                </h3>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => handleSeveritySelect('Mild')}
                  className="group p-5 rounded-2xl bg-black/20 hover:bg-white/10 text-white transition-all duration-300 border border-white/10 hover:border-white/30 flex flex-col items-center text-center backdrop-blur-md"
                >
                  <span className="text-base font-medium tracking-tight mb-1">{t.severityMild || "Mild"}</span>
                  <span className="text-xs font-light text-white/50">{t.severityMildDesc || "Can wait"}</span>
                </button>
                <button 
                  onClick={() => handleSeveritySelect('Moderate')}
                  className="group p-5 rounded-2xl bg-black/20 hover:bg-white/10 text-white transition-all duration-300 border border-white/10 hover:border-white/30 flex flex-col items-center text-center backdrop-blur-md"
                >
                  <span className="text-base font-medium tracking-tight mb-1">{t.severityModerate || "Moderate"}</span>
                  <span className="text-xs font-light text-white/50">{t.severityModerateDesc || "Needs attention"}</span>
                </button>
                <button 
                  onClick={() => handleSeveritySelect('Severe')}
                  className="group p-5 rounded-2xl bg-black/20 hover:bg-white/10 text-white transition-all duration-300 border border-white/10 hover:border-red-500/50 flex flex-col items-center text-center backdrop-blur-md relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-base font-medium tracking-tight mb-1 relative z-10">{t.severitySevere || "Severe"}</span>
                  <span className="text-xs font-light text-white/50 relative z-10">{t.severitySevereDesc || "Urgent care"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
