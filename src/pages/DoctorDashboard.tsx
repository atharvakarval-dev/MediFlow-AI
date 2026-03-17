import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, AlertCircle, Search, Filter, Stethoscope, Activity, FileText, Calendar, X, CheckCircle2, Bell, ChevronRight } from 'lucide-react';
import { useAppStore, type Patient } from '../store/appStore';
import { translations } from '../utils/translations';
import { DOCTORS } from '../utils/doctorAllocation';

export function DoctorDashboard() {
  const { patientsQueue, language, updatePatientInQueue } = useAppStore();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patientsQueue[0] || null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const t = translations[language].dashboard;

  const specialties = Array.from(new Set(DOCTORS.map(d => d.specialty))).sort();
  const filteredDoctors = selectedSpecialty 
    ? DOCTORS.filter(d => d.specialty === selectedSpecialty)
    : DOCTORS;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/20 text-red-200 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-200 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctorId || !followUpDate || !followUpTime) return;

    const doctor = DOCTORS.find(d => d.id === selectedDoctorId);
    if (!doctor) return;

    updatePatientInQueue(selectedPatient.id, {
      followUp: {
        date: followUpDate,
        time: followUpTime,
        doctor: doctor.name,
        specialty: doctor.specialty,
        notes: followUpNotes
      }
    });

    setSelectedPatient(prev => prev ? {
      ...prev,
      followUp: {
        date: followUpDate,
        time: followUpTime,
        doctor: doctor.name,
        specialty: doctor.specialty,
        notes: followUpNotes
      }
    } : null);

    setIsScheduling(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    setFollowUpDate('');
    setFollowUpTime('');
    setSelectedDoctorId('');
    setFollowUpNotes('');
  };

  // Mock data for new sections
  const alerts = [
    { id: 1, type: 'critical', message: 'Lab results ready for Patient P-1042 (Critical)', time: '10m ago' },
    { id: 2, type: 'warning', message: 'Dr. Smith requested consult for P-8831', time: '1h ago' },
  ];

  const upcomingAppointments = [
    { id: 1, name: 'Sarah Jenkins', time: '14:30', type: 'Follow-up' },
    { id: 2, name: 'Michael Chen', time: '15:15', type: 'Consultation' },
    { id: 3, name: 'Emma Watson', time: '16:00', type: 'Review' },
  ];

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Left Sidebar - Patient Queue */}
      <div className="w-80 liquid-glass-strong border-r border-white/10 flex flex-col h-full z-20 backdrop-blur-xl shadow-[8px_0_32px_rgba(0,0,0,0.2)] shrink-0">
        <div className="p-6 border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-white/5 blur-[80px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-medium text-white flex items-center gap-3 tracking-tight">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                <Users className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              {t.queue}
            </h2>
            <div className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-full border border-white/10">
              {patientsQueue.length} Waiting
            </div>
          </div>
          <div className="relative z-10 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder={t.search}
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all shadow-inner"
              />
            </div>
            <button className="w-10 h-10 liquid-glass rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {patientsQueue.map((patient) => (
            <button
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${selectedPatient?.id === patient.id ? 'bg-white/10 border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.2)]' : 'liquid-glass hover:bg-white/5 border border-white/5 shadow-sm hover:shadow-md'}`}
            >
              {selectedPatient?.id === patient.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
              )}
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-white text-base tracking-tight truncate pr-2">{patient.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border shrink-0 ${getPriorityColor(patient.priority)}`}>
                  {translations[language].triage[`priority${patient.priority}` as keyof typeof translations[typeof language]['triage']] || patient.priority}
                </span>
              </div>
              <div className="text-xs text-white/50 flex items-center gap-2 mb-3 font-light">
                <span>{patient.age}y</span> • <span>{patient.gender}</span> • <span className="font-mono">{patient.id}</span>
              </div>
              <div className="text-xs text-white/70 line-clamp-1 font-light bg-black/20 p-2 rounded-lg border border-white/5">
                {patient.symptoms.join(', ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden relative z-10">
        
        {/* Center Column - Current Patient Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div 
                key={selectedPatient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Patient Header Card */}
                <div className="liquid-glass-strong p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-white/5 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight">{selectedPatient.name}</h1>
                        {selectedPatient.severity && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${
                            selectedPatient.severity === 'Severe' ? 'bg-red-500/20 text-red-200 border-red-500/30' :
                            selectedPatient.severity === 'Moderate' ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' :
                            'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                          }`}>
                            {translations[language].intake[`severity${selectedPatient.severity}` as keyof typeof translations[typeof language]['intake']] || selectedPatient.severity}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/60 font-light text-sm mt-4">
                        <span className="flex items-center gap-1.5"><span className="text-white/40 uppercase tracking-widest text-[10px] font-medium">ID</span> <span className="font-mono text-white/80">{selectedPatient.id}</span></span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="flex items-center gap-1.5"><span className="text-white/40 uppercase tracking-widest text-[10px] font-medium">Age</span> <span className="text-white/80">{selectedPatient.age}</span></span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="flex items-center gap-1.5"><span className="text-white/40 uppercase tracking-widest text-[10px] font-medium">Gender</span> <span className="text-white/80">{selectedPatient.gender}</span></span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="flex items-center gap-1.5"><span className="text-white/40 uppercase tracking-widest text-[10px] font-medium">Lang</span> <span className="text-white/80">{selectedPatient.language}</span></span>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button className="px-5 py-2.5 liquid-glass border border-white/10 rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-all duration-300 shadow-sm">
                        {t.viewHistory}
                      </button>
                      <button className="px-5 py-2.5 bg-white hover:bg-gray-100 text-black rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105">
                        <Stethoscope className="w-4 h-4 text-black" strokeWidth={2} /> {t.startConsult}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Triage & Transcript Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* AI Triage Summary */}
                  <div className="liquid-glass-strong rounded-[2rem] p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl flex flex-col">
                    <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2.5 tracking-tight">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                        <Activity className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                      {t.triageSummary}
                    </h3>
                    <div className="mb-6">
                      <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-3">{t.reportedSymptoms}</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.symptoms.map((s, i) => (
                          <span key={i} className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 border border-white/5 shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-black/20 p-5 rounded-xl border border-white/5 flex-1">
                      <h4 className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-3">{t.recommendedTests}</h4>
                      <ul className="space-y-2.5">
                        {selectedPatient.recommendedTests.map((test, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-white/70 text-sm font-light">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div> {test}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Voice Transcript */}
                  <div className="liquid-glass-strong rounded-[2rem] p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl flex flex-col">
                    <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2.5 tracking-tight">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                        <FileText className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                      {t.transcript}
                    </h3>
                    <div className="bg-black/20 p-5 rounded-xl flex-1 overflow-y-auto border border-white/5">
                      <p className="text-white/70 italic font-serif text-base leading-relaxed">
                        "{selectedPatient.transcript}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Follow-up Info */}
                {selectedPatient.followUp && (
                  <div className="liquid-glass-strong rounded-[2rem] p-6 border border-white/10 flex items-start gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl relative overflow-hidden">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white shrink-0 border border-white/10 shadow-inner relative z-10">
                      <Calendar className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10 w-full">
                      <h3 className="text-lg font-medium text-white mb-1 tracking-tight">{t.scheduledFollowUp || "Scheduled Follow-up"}</h3>
                      <p className="text-white/70 text-sm font-light mb-3">
                        <span className="font-medium text-white/90">{selectedPatient.followUp.date}</span> at <span className="font-medium text-white/90">{selectedPatient.followUp.time}</span> with <span className="font-medium text-white/90">{selectedPatient.followUp.doctor}</span> <span className="text-white/50">({selectedPatient.followUp.specialty})</span>
                      </p>
                      {selectedPatient.followUp.notes && (
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest block mb-1.5">{t.referralNotes || "Notes"}</span>
                          <p className="text-white/70 text-sm font-light leading-relaxed">{selectedPatient.followUp.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Area */}
                <div className="liquid-glass-strong rounded-[2rem] p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl">
                  <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2.5 tracking-tight">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                      <AlertCircle className="w-4 h-4 text-white" strokeWidth={1.5} />
                    </div>
                    {t.actions}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="group liquid-glass hover:bg-white/10 border border-white/5 p-5 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                      <span className="block font-medium text-sm text-white mb-1.5 tracking-tight">{t.orderTests}</span>
                      <span className="text-[11px] text-white/50 font-light leading-relaxed line-clamp-2">{t.orderTestsDesc}</span>
                    </button>
                    <button className="group liquid-glass hover:bg-white/10 border border-white/5 p-5 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                      <span className="block font-medium text-sm text-white mb-1.5 tracking-tight">{t.updateNotes}</span>
                      <span className="text-[11px] text-white/50 font-light leading-relaxed line-clamp-2">{t.updateNotesDesc}</span>
                    </button>
                    <button 
                      onClick={() => setIsScheduling(true)}
                      className="group liquid-glass hover:bg-white/10 border border-white/5 p-5 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
                    >
                      <span className="block font-medium text-sm text-white mb-1.5 tracking-tight">{t.scheduleFollowUp || "Schedule Follow-up"}</span>
                      <span className="text-[11px] text-white/50 font-light leading-relaxed line-clamp-2">{t.scheduleFollowUpDesc || "Book next appointment"}</span>
                    </button>
                    <button className="group bg-white hover:bg-gray-100 text-black p-5 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="block font-medium text-sm mb-1.5 tracking-tight relative z-10">{t.complete}</span>
                      <span className="text-[11px] text-black/60 font-light leading-relaxed line-clamp-2 relative z-10">{t.completeDesc}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-white/30 min-h-[400px]"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5 border border-white/5 shadow-inner">
                  <Users className="w-8 h-8 opacity-50" strokeWidth={1.5} />
                </div>
                <p className="text-lg font-medium tracking-tight">{t.selectPatient}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Alerts & Upcoming */}
        <div className="w-full xl:w-80 liquid-glass-strong border-l border-white/10 flex flex-col h-full z-20 backdrop-blur-xl shrink-0">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-medium text-white flex items-center gap-2.5 tracking-tight">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                <Bell className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              Alerts & Notifications
            </h2>
          </div>
          <div className="p-4 space-y-3 border-b border-white/10">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-xl border ${alert.type === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.type === 'critical' ? 'text-red-400' : 'text-orange-400'}`} strokeWidth={2} />
                  <div>
                    <p className="text-sm text-white/90 font-medium leading-snug mb-1">{alert.message}</p>
                    <p className="text-[10px] text-white/50 font-mono">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-medium text-white flex items-center gap-2.5 tracking-tight">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                <Clock className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              Upcoming
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            {upcomingAppointments.map(apt => (
              <div key={apt.id} className="liquid-glass p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-white mb-0.5">{apt.name}</p>
                  <p className="text-xs text-white/50 font-light">{apt.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-white/80 bg-white/5 px-2 py-1 rounded-md">{apt.time}</span>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-6 right-1/2 translate-x-1/2 liquid-glass-strong text-white px-5 py-3 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 flex items-center gap-3 z-50 backdrop-blur-xl"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2} />
            </div>
            <span className="font-medium text-sm tracking-tight">{t.followUpSuccess || "Follow-up appointment scheduled successfully."}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scheduling Modal */}
      <AnimatePresence>
        {isScheduling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass-strong rounded-[2rem] border border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-[0_16px_64px_rgba(0,0,0,0.5)] relative"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              
              <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10">
                <h2 className="text-xl font-medium text-white flex items-center gap-3 tracking-tight">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                    <Calendar className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  {t.scheduleFollowUpTitle || "Schedule Follow-up"}
                </h2>
                <button 
                  onClick={() => setIsScheduling(false)}
                  className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              
              <form onSubmit={handleScheduleSubmit} className="p-6 overflow-y-auto relative z-10 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">{t.patient || "Patient"}</label>
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl text-white font-medium text-sm shadow-inner">
                      {selectedPatient?.name} <span className="text-white/50 font-mono text-xs ml-2">({selectedPatient?.id})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">{t.date || "Date"}</label>
                      <input 
                        type="date" 
                        required
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full p-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 [color-scheme:dark] shadow-inner transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">{t.time || "Time"}</label>
                      <input 
                        type="time" 
                        required
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        className="w-full p-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 [color-scheme:dark] shadow-inner transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">{t.specialist || "Filter by Specialty"}</label>
                      <select 
                        value={selectedSpecialty}
                        onChange={(e) => {
                          setSelectedSpecialty(e.target.value);
                          setSelectedDoctorId('');
                        }}
                        className="w-full p-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 [&>option]:bg-slate-900 shadow-inner transition-all appearance-none"
                      >
                        <option value="">All Specialties</option>
                        {specialties.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">{t.specialist || "Specialist / Doctor"}</label>
                      <select 
                        required
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full p-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 [&>option]:bg-slate-900 shadow-inner transition-all appearance-none"
                      >
                        <option value="">{t.selectDoctor || "Select a doctor..."}</option>
                        {filteredDoctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} - {doc.specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5">{t.referralNotes || "Referral Notes / Instructions"}</label>
                    <textarea 
                      rows={3}
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      placeholder={t.notesPlaceholder || "Add any specific instructions for the follow-up..."}
                      className="w-full p-3 bg-black/20 border border-white/5 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none shadow-inner transition-all font-light"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsScheduling(false)}
                    className="flex-1 py-3 px-4 liquid-glass border border-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    {t.cancel || "Cancel"}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                  >
                    {t.schedule || "Confirm Booking"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
