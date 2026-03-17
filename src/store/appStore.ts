import { create } from 'zustand';
import { Language } from '../utils/translations';

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  language: string;
  symptoms: string[];
  transcript: string;
  recommendedTests: string[];
  assignedDoctor: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  severity?: 'Mild' | 'Moderate' | 'Severe';
  currentLocation: string;
  nextDestination: string;
  followUp?: {
    date: string;
    time: string;
    doctor: string;
    specialty: string;
    notes: string;
  };
};

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient | null) => void;
  updatePatient: (updates: Partial<Patient>) => void;
  patientsQueue: Patient[];
  addPatientToQueue: (patient: Patient) => void;
  removePatientFromQueue: (id: string) => void;
  updatePatientInQueue: (id: string, updates: Partial<Patient>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  currentPatient: null,
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  updatePatient: (updates) => set((state) => ({
    currentPatient: state.currentPatient ? { ...state.currentPatient, ...updates } : null
  })),
  patientsQueue: [
    {
      id: 'P-1001',
      name: 'Sarah Jenkins',
      age: 42,
      gender: 'Female',
      language: 'English',
      symptoms: ['Chest Pain', 'Shortness of Breath'],
      transcript: "I've been having this really tight pain in my chest since this morning, and it's hard to catch my breath.",
      recommendedTests: ['ECG', 'Blood Test (Troponin)'],
      assignedDoctor: 'Dr. Smith (Cardiology)',
      priority: 'Critical',
      currentLocation: 'Triage',
      nextDestination: 'Room 102 (ECG)'
    },
    {
      id: 'P-1002',
      name: 'Michael Chen',
      age: 28,
      gender: 'Male',
      language: 'English',
      symptoms: ['Fever', 'Cough', 'Fatigue'],
      transcript: "I have a high fever and a really bad cough that won't go away. I feel extremely tired.",
      recommendedTests: ['Chest X-Ray', 'CBC'],
      assignedDoctor: 'Dr. Lee (General Medicine)',
      priority: 'Medium',
      currentLocation: 'Waiting Area B',
      nextDestination: 'Room 205 (Consultation)'
    }
  ],
  addPatientToQueue: (patient) => set((state) => ({ patientsQueue: [...state.patientsQueue, patient] })),
  removePatientFromQueue: (id) => set((state) => ({ patientsQueue: state.patientsQueue.filter(p => p.id !== id) })),
  updatePatientInQueue: (id, updates) => set((state) => ({
    patientsQueue: state.patientsQueue.map(p => p.id === id ? { ...p, ...updates } : p),
    currentPatient: state.currentPatient?.id === id ? { ...state.currentPatient, ...updates } : state.currentPatient
  }))
}));
