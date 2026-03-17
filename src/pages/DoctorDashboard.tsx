import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, AlertCircle, Search, Filter, Stethoscope, Activity, FileText, Calendar, X, CheckCircle2 } from 'lucide-react';
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
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
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

    // Update local selected patient state to reflect changes immediately
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
    
    // Reset form
    setFollowUpDate('');
    setFollowUpTime('');
    setSelectedDoctorId('');
    setFollowUpNotes('');
  };

  return (
    <div className="flex h-full bg-slate-50 relative">
      {/* Sidebar Queue */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> {t.queue}
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t.search}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {patientsQueue.map((patient) => (
            <button
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selectedPatient?.id === patient.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-900">{patient.name}</span>
                <div className="flex gap-2">
                  {patient.severity && (
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      patient.severity === 'Severe' ? 'bg-rose-100 text-rose-700' :
                      patient.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {translations[language].intake[`severity${patient.severity}` as keyof typeof translations[typeof language]['intake']] || patient.severity}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getPriorityColor(patient.priority)}`}>
                    {translations[language].triage[`priority${patient.priority}` as keyof typeof translations[typeof language]['triage']] || patient.priority}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-2 mb-2">
                <span>{patient.age}y</span> • <span>{patient.gender}</span> • <span>{patient.id}</span>
              </div>
              <div className="text-xs text-slate-600 line-clamp-1">
                <span className="font-semibold">{t.symptoms || "Symptoms"}:</span> {patient.symptoms.join(', ')}
              </div>
              {patient.followUp && (
                <div className="mt-2 text-xs font-medium text-indigo-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {t.followUpScheduled || "Follow-up scheduled"}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-8 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg shadow-lg border border-emerald-200 flex items-center gap-2 z-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">{t.followUpSuccess || "Follow-up appointment scheduled successfully."}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedPatient ? (
          <motion.div 
            key={selectedPatient.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedPatient.name}</h1>
                <div className="flex items-center gap-4 text-slate-500">
                  <span>{t.id || "ID"}: {selectedPatient.id}</span>
                  <span>{t.age || "Age"}: {selectedPatient.age}</span>
                  <span>{t.gender || "Gender"}: {selectedPatient.gender}</span>
                  <span>{t.language || "Language"}: {selectedPatient.language}</span>
                  {selectedPatient.severity && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedPatient.severity === 'Severe' ? 'bg-rose-100 text-rose-700' :
                      selectedPatient.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {translations[language].intake[`severity${selectedPatient.severity}` as keyof typeof translations[typeof language]['intake']] || selectedPatient.severity}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                  {t.viewHistory}
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> {t.startConsult}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* AI Triage Summary */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> {t.triageSummary}
                </h3>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.reportedSymptoms}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.symptoms.map((s, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.recommendedTests}</h4>
                  <ul className="space-y-2">
                    {selectedPatient.recommendedTests.map((test, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-700 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {test}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Voice Transcript */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> {t.transcript}
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 overflow-y-auto min-h-[150px]">
                  <p className="text-slate-700 italic leading-relaxed">
                    "{selectedPatient.transcript}"
                  </p>
                </div>
              </div>
            </div>

            {/* Follow-up Info (if exists) */}
            {selectedPatient.followUp && (
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 mb-6 flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-900 mb-1">{t.scheduledFollowUp || "Scheduled Follow-up"}</h3>
                  <p className="text-indigo-800 font-medium mb-1">
                    {selectedPatient.followUp.date} at {selectedPatient.followUp.time} with {selectedPatient.followUp.doctor} ({selectedPatient.followUp.specialty})
                  </p>
                  {selectedPatient.followUp.notes && (
                    <p className="text-indigo-700 text-sm mt-2 bg-white/50 p-3 rounded-lg border border-indigo-100/50">
                      <span className="font-semibold block mb-1">{t.referralNotes || "Notes"}:</span>
                      {selectedPatient.followUp.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Area */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-400" /> {t.actions}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-xl text-left transition-colors">
                  <span className="block font-semibold mb-1">{t.orderTests}</span>
                  <span className="text-xs text-slate-400">{t.orderTestsDesc}</span>
                </button>
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-xl text-left transition-colors">
                  <span className="block font-semibold mb-1">{t.updateNotes}</span>
                  <span className="text-xs text-slate-400">{t.updateNotesDesc}</span>
                </button>
                <button 
                  onClick={() => setIsScheduling(true)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-xl text-left transition-colors"
                >
                  <span className="block font-semibold mb-1">{t.scheduleFollowUp || "Schedule Follow-up"}</span>
                  <span className="text-xs text-slate-400">{t.scheduleFollowUpDesc || "Book next appointment"}</span>
                </button>
                <button className="bg-indigo-500 hover:bg-indigo-600 border border-indigo-400 p-4 rounded-xl text-left transition-colors">
                  <span className="block font-semibold mb-1">{t.complete}</span>
                  <span className="text-xs text-indigo-200">{t.completeDesc}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">{t.selectPatient}</p>
          </div>
        )}
      </div>

      {/* Scheduling Modal */}
      <AnimatePresence>
        {isScheduling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  {t.scheduleFollowUpTitle || "Schedule Follow-up / Referral"}
                </h2>
                <button 
                  onClick={() => setIsScheduling(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleScheduleSubmit} className="p-6 overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.patient || "Patient"}</label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium">
                      {selectedPatient?.name} ({selectedPatient?.id})
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t.date || "Date"}</label>
                      <input 
                        type="date" 
                        required
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t.time || "Time"}</label>
                      <input 
                        type="time" 
                        required
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t.specialist || "Filter by Specialty"}</label>
                      <select 
                        value={selectedSpecialty}
                        onChange={(e) => {
                          setSelectedSpecialty(e.target.value);
                          setSelectedDoctorId('');
                        }}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">All Specialties</option>
                        {specialties.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">{t.specialist || "Specialist / Doctor"}</label>
                      <select 
                        required
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.referralNotes || "Referral Notes / Instructions"}</label>
                    <textarea 
                      rows={3}
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      placeholder={t.notesPlaceholder || "Add any specific instructions for the follow-up..."}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsScheduling(false)}
                    className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {t.cancel || "Cancel"}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
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
