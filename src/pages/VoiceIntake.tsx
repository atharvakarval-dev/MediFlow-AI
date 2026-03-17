import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Volume2, AlertCircle, PlayCircle, Activity } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { translations } from '../utils/translations';
import { allocateDoctor } from '../utils/doctorAllocation';
import { GoogleGenAI } from '@google/genai';

type Severity = 'Mild' | 'Moderate' | 'Severe';

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const t = translations[language].intake;
  const simulateSpeech = t.simulatedSpeech;

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setBrowserSupported(false);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        await processAudio(audioBlob, mediaRecorder.mimeType);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setShowPrompt(false);
      setTranscript('Listening...');
      setConfidence(null);
      setShowSeveritySelection(false);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please allow microphone access or use the simulate button.");
    }
  };

  const processAudio = async (blob: Blob, mimeType: string) => {
    setIsProcessing(true);
    setTranscript('Transcribing audio...');
    try {
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = reject;
      });
        
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64data,
                  mimeType: mimeType || 'audio/webm',
                },
              },
              {
                text: `Transcribe the following audio accurately in the language spoken. Output ONLY the transcription, without any extra text or markdown.`,
              },
            ],
          },
        ],
      });
      
      const text = response.text || '';
      setTranscript(text);
      setConfidence(95); // Simulated confidence for GenAI
      setIsProcessing(false);
      setShowSeveritySelection(true);
    } catch (error) {
      console.error("Transcription error:", error);
      setTranscript("Error transcribing audio. Please try again or use the simulate button.");
      setIsProcessing(false);
      setShowSeveritySelection(true);
    }
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
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleSeveritySelect = (severity: Severity) => {
    setShowSeveritySelection(false);
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const englishSymptoms = translations['en'].intake.symptoms;
      
      // Base priority on severity
      let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
      if (severity === 'Severe') priority = 'Critical';
      else if (severity === 'Moderate') priority = 'High';
      else priority = 'Low';
      
      const allocation = allocateDoctor(englishSymptoms, priority, patientsQueue, severity, transcript || simulateSpeech);
      
      updatePatient({
        transcript: transcript || simulateSpeech,
        symptoms: t.symptoms,
        recommendedTests: t.tests,
        priority: priority,
        severity: severity,
        assignedDoctor: `${allocation.doctor.name} (${allocation.doctor.specialty})`,
        nextDestination: allocation.doctor.room
      });
      navigate('/triage');
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{t.title}</h1>
        <p className="text-xl text-slate-600">{t.subtitle}</p>
      </div>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 flex flex-col items-center">
        {isRecording && (
          <div className="absolute inset-0 bg-indigo-50/50 rounded-3xl animate-pulse -z-10"></div>
        )}

        <div className="mb-10 relative">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-indigo-100 scale-110' : 'bg-slate-100'}`}>
            {isRecording ? (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-40 h-40 border-4 border-indigo-200 rounded-full animate-ping opacity-75"></div>
                <div className="absolute w-36 h-36 border-4 border-indigo-300 rounded-full animate-pulse"></div>
                <Mic className="w-12 h-12 text-indigo-600 relative z-10" />
              </div>
            ) : (
              <Mic className="w-12 h-12 text-slate-400" />
            )}
          </div>
        </div>

        {!browserSupported && (
          <div className="w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{t.notSupported}</p>
          </div>
        )}

        <div className="w-full min-h-[120px] bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100 relative">
          {showPrompt ? (
            <p className="text-slate-400 text-center italic text-lg flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5" /> {t.prompt}
            </p>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <p className="text-slate-800 text-lg leading-relaxed font-medium">
                {transcript}
                {isRecording && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse"></span>}
              </p>
              
              {confidence !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-2 text-sm font-medium border-t border-slate-200 pt-4"
                >
                  <span className="text-slate-500">{t.confidenceScore}:</span>
                  <div className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                    confidence > 80 ? 'bg-emerald-100 text-emerald-700' : 
                    confidence > 60 ? 'bg-amber-100 text-amber-700' : 
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {confidence}%
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {!isRecording && !isProcessing && !showSeveritySelection && (
            <>
              {browserSupported && (
                <button 
                  onClick={handleStartRecording}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
                >
                  <Mic className="w-6 h-6" /> {t.start}
                </button>
              )}
              <button 
                onClick={handleSimulateRecording}
                className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  browserSupported 
                    ? 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                }`}
              >
                <PlayCircle className="w-6 h-6" /> {t.simulateBtn}
              </button>
            </>
          )}

          {isRecording && !isProcessing && !showSeveritySelection && (
            <button 
              onClick={handleStopRecording}
              className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-3 animate-bounce"
            >
              <Square className="w-6 h-6 fill-current" /> {t.stop}
            </button>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center text-indigo-600">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-semibold text-lg">{t.analyzing}</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showSeveritySelection && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mt-6 pt-6 border-t border-slate-100"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center flex items-center justify-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                {t.severityPrompt || "How severe are your symptoms right now?"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => handleSeveritySelect('Mild')}
                  className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                >
                  {t.severityMild || "Mild"}
                  <span className="block text-xs font-normal mt-1 opacity-80">{t.severityMildDesc || "Can wait"}</span>
                </button>
                <button 
                  onClick={() => handleSeveritySelect('Moderate')}
                  className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition-colors"
                >
                  {t.severityModerate || "Moderate"}
                  <span className="block text-xs font-normal mt-1 opacity-80">{t.severityModerateDesc || "Needs attention"}</span>
                </button>
                <button 
                  onClick={() => handleSeveritySelect('Severe')}
                  className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition-colors"
                >
                  {t.severitySevere || "Severe"}
                  <span className="block text-xs font-normal mt-1 opacity-80">{t.severitySevereDesc || "Urgent care"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
