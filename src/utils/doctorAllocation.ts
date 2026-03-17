import { Patient } from '../store/appStore';

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  room: string;
  status: 'Available' | 'Busy' | 'Off-duty';
  experience: number;
};

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Gastroenterologist',
  'Orthopedic',
  'Dermatologist',
  'ENT Specialist',
  'Pediatrician',
  'Pulmonologist',
  'Psychiatrist',
];

export const DOCTORS: Doctor[] = Array.from({ length: 120 }, (_, i) => {
  const specialty = SPECIALTIES[i % SPECIALTIES.length];
  const block = String.fromCharCode(65 + (i % 4));
  const floor = (i % 5) + 1;
  const roomNum = 100 * floor + (i % 20) + 1;
  const statusRoll = Math.random();

  return {
    id: `D${i + 1}`,
    name: `Dr. ${['Smith', 'Lee', 'Patel', 'Garcia', 'Kim', 'Wong', 'Ali', 'Chen', 'Singh', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'][i % 15]} ${i + 1}`,
    specialty,
    room: `Block ${block} - ${floor}F - OPD-${roomNum}`,
    status: statusRoll > 0.25 ? 'Available' : statusRoll > 0.1 ? 'Busy' : 'Off-duty',
    experience: Math.floor(Math.random() * 25) + 2,
  };
});

// Maps keywords (symptoms, diseases, body parts) → specialty
const KEYWORD_SPECIALTY_MAP: { keywords: string[]; specialty: string; weight: number }[] = [
  {
    keywords: ['chest pain', 'chest tightness', 'heart attack', 'palpitation', 'irregular heartbeat', 'shortness of breath', 'high blood pressure', 'hypertension', 'cardiac', 'angina', 'heart failure', 'edema in legs'],
    specialty: 'Cardiologist',
    weight: 10,
  },
  {
    keywords: ['headache', 'migraine', 'seizure', 'epilepsy', 'stroke', 'numbness', 'tingling', 'dizziness', 'vertigo', 'memory loss', 'confusion', 'neck stiffness', 'meningitis', 'tremor', 'paralysis', 'fainting'],
    specialty: 'Neurologist',
    weight: 10,
  },
  {
    keywords: ['stomach pain', 'abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'heartburn', 'acid reflux', 'bloating', 'indigestion', 'gastritis', 'ulcer', 'liver', 'jaundice', 'ibs', 'crohn', 'colitis', 'rectal bleeding'],
    specialty: 'Gastroenterologist',
    weight: 10,
  },
  {
    keywords: ['fracture', 'broken bone', 'joint pain', 'back pain', 'knee pain', 'hip pain', 'shoulder pain', 'muscle spasm', 'sprain', 'arthritis', 'osteoporosis', 'scoliosis', 'slip disc', 'sports injury', 'swollen joint'],
    specialty: 'Orthopedic',
    weight: 10,
  },
  {
    keywords: ['skin rash', 'itching', 'acne', 'eczema', 'psoriasis', 'hives', 'skin lesion', 'mole', 'dermatitis', 'fungal infection', 'hair loss', 'nail problem', 'wart', 'skin allergy'],
    specialty: 'Dermatologist',
    weight: 10,
  },
  {
    keywords: ['ear ache', 'ear pain', 'hearing loss', 'sore throat', 'tonsillitis', 'sinus', 'sinusitis', 'nasal congestion', 'runny nose', 'nosebleed', 'hoarseness', 'voice loss', 'throat infection', 'ear infection', 'tinnitus'],
    specialty: 'ENT Specialist',
    weight: 10,
  },
  {
    keywords: ['cough', 'shortness of breath', 'wheezing', 'asthma', 'bronchitis', 'pneumonia', 'tuberculosis', 'copd', 'lung', 'breathing difficulty', 'oxygen', 'respiratory', 'inhaler', 'pleural'],
    specialty: 'Pulmonologist',
    weight: 10,
  },
  {
    keywords: ['anxiety', 'depression', 'panic attack', 'mental health', 'stress', 'insomnia', 'hallucination', 'bipolar', 'schizophrenia', 'suicidal', 'ocd', 'ptsd', 'eating disorder', 'mood swing', 'phobia'],
    specialty: 'Psychiatrist',
    weight: 10,
  },
  {
    keywords: ['child', 'infant', 'baby', 'toddler', 'newborn', 'pediatric', 'childhood fever', 'colic', 'vaccination', 'growth', 'developmental'],
    specialty: 'Pediatrician',
    weight: 10,
  },
  {
    keywords: ['fever', 'cold', 'flu', 'fatigue', 'body ache', 'weakness', 'general checkup', 'mild headache', 'dehydration', 'infection', 'viral', 'bacterial'],
    specialty: 'General Physician',
    weight: 5,
  },
];

function inferSpecialty(symptoms: string[], transcript: string): string {
  const text = [...symptoms, transcript].join(' ').toLowerCase();
  const scores: Record<string, number> = {};

  for (const { keywords, specialty, weight } of KEYWORD_SPECIALTY_MAP) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[specialty] = (scores[specialty] || 0) + weight;
      }
    }
  }

  // Return specialty with highest score, fallback to General Physician
  let best = 'General Physician';
  let bestScore = 0;
  for (const [spec, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = spec;
    }
  }
  return best;
}

export function allocateDoctor(
  symptoms: string[],
  priority: 'Low' | 'Medium' | 'High' | 'Critical',
  currentQueue: Patient[],
  severity?: 'Mild' | 'Moderate' | 'Severe',
  transcript?: string
): { doctor: Doctor; score: number; reason: string } {
  const isCritical = priority === 'Critical' || severity === 'Severe';
  const requiredSpecialty = inferSpecialty(symptoms, transcript || symptoms.join(' '));

  // Build doctor load map
  const doctorLoads: Record<string, number> = {};
  DOCTORS.forEach(d => (doctorLoads[d.id] = 0));
  currentQueue.forEach(patient => {
    const match = patient.assignedDoctor.match(/^(Dr\. [^(]+)/);
    if (match) {
      const doc = DOCTORS.find(d => d.name === match[1].trim());
      if (doc) {
        doctorLoads[doc.id] += patient.priority === 'Critical' ? 3 : patient.priority === 'High' ? 2 : 1;
      }
    }
  });

  // Candidate filtering based on status and criticality
  const candidates = DOCTORS.filter(d => {
    if (d.status === 'Available') return true;
    if (d.status === 'Busy') return isCritical; // allow Busy doctors only for critical
    if (d.status === 'Off-duty') return priority === 'Critical' && severity === 'Severe'; // last resort
    return false;
  });

  const pool = candidates.length > 0 ? candidates : DOCTORS;

  let bestDoctor = pool[0];
  let bestScore = -Infinity;
  let allocationReason = '';

  for (const doctor of pool) {
    let score = 0;
    const load = doctorLoads[doctor.id] || 0;
    const isMatch = doctor.specialty === requiredSpecialty;
    const isGeneralist = doctor.specialty === 'General Physician';

    // Specialty match
    if (isMatch) score += 120;
    else if (isGeneralist) score += 25;
    else score -= 80;

    // Status penalty
    if (doctor.status === 'Busy') score -= isCritical ? 20 : 60;
    if (doctor.status === 'Off-duty') score -= 100;

    // Load penalty — more aggressive for non-critical
    const loadPenalty = isCritical ? 10 : 20;
    score -= load * loadPenalty;

    // Experience bonus — scales heavily for critical/severe
    if (isCritical) score += doctor.experience * 3;
    else if (priority === 'High') score += doctor.experience * 1.5;
    else score += doctor.experience * 0.5;

    // Mild severity: prefer lower-experience doctors to free up senior staff
    if (severity === 'Mild') score -= doctor.experience * 0.5;

    // Tie-breaking jitter
    score += Math.random() * 3;

    if (score > bestScore) {
      bestScore = score;
      bestDoctor = doctor;
      allocationReason = isMatch
        ? `Specialty match: ${requiredSpecialty} | Status: ${doctor.status} | Load: ${load} | Exp: ${doctor.experience}y`
        : `Fallback to ${doctor.specialty} (${requiredSpecialty} unavailable) | Status: ${doctor.status} | Load: ${load}`;
    }
  }

  return { doctor: bestDoctor, score: bestScore, reason: allocationReason };
}
