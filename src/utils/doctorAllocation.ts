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
  'Pediatrician'
];

// Generate 100+ mock doctors
export const DOCTORS: Doctor[] = Array.from({ length: 120 }, (_, i) => {
  const specialty = SPECIALTIES[i % SPECIALTIES.length];
  const block = String.fromCharCode(65 + (i % 4)); // A, B, C, D
  const floor = (i % 5) + 1;
  const roomNum = 100 * floor + (i % 20) + 1;
  
  return {
    id: `D${i + 1}`,
    name: `Dr. ${['Smith', 'Lee', 'Patel', 'Garcia', 'Kim', 'Wong', 'Ali', 'Chen', 'Singh', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'][i % 15]} ${i + 1}`,
    specialty,
    room: `Block ${block} - ${floor}F - OPD-${roomNum}`,
    status: Math.random() > 0.1 ? 'Available' : 'Busy', // 90% available
    experience: Math.floor(Math.random() * 25) + 2, // 2 to 26 years
  };
});

const SYMPTOM_TO_SPECIALTY: Record<string, string> = {
  // Cardiology
  'Chest Pain': 'Cardiologist',
  'Shortness of Breath': 'Cardiologist',
  'Palpitations': 'Cardiologist',
  'High Blood Pressure': 'Cardiologist',
  'Heart': 'Cardiologist',
  
  // Neurology
  'Severe Headache': 'Neurologist',
  'Dizziness': 'Neurologist',
  'Neck Stiffness': 'Neurologist',
  'Numbness': 'Neurologist',
  'Seizures': 'Neurologist',
  'Brain': 'Neurologist',
  
  // Gastroenterology
  'Stomach Pain': 'Gastroenterologist',
  'Nausea': 'Gastroenterologist',
  'Vomiting': 'Gastroenterologist',
  'Diarrhea': 'Gastroenterologist',
  'Heartburn': 'Gastroenterologist',
  'Stomach': 'Gastroenterologist',
  'Belly': 'Gastroenterologist',
  
  // Orthopedics
  'Fracture': 'Orthopedic',
  'Joint Pain': 'Orthopedic',
  'Back Pain': 'Orthopedic',
  'Muscle Spasm': 'Orthopedic',
  'Bone': 'Orthopedic',
  'Knee': 'Orthopedic',
  
  // Dermatology
  'Skin Rash': 'Dermatologist',
  'Itching': 'Dermatologist',
  'Acne': 'Dermatologist',
  'Skin Lesion': 'Dermatologist',
  'Skin': 'Dermatologist',
  
  // ENT
  'Ear Ache': 'ENT Specialist',
  'Sore Throat': 'ENT Specialist',
  'Sinus Pressure': 'ENT Specialist',
  'Hearing Loss': 'ENT Specialist',
  'Ear': 'ENT Specialist',
  'Throat': 'ENT Specialist',
  'Nose': 'ENT Specialist',
  
  // Pediatrics (usually age-based, but adding some specific symptoms)
  'Childhood Fever': 'Pediatrician',
  'Colic': 'Pediatrician',
  'Child': 'Pediatrician',
  'Baby': 'Pediatrician',
  
  // General Physician (High frequency)
  'Fever': 'General Physician',
  'Cough': 'General Physician',
  'Fatigue': 'General Physician',
  'Body Ache': 'General Physician',
  'Mild Headache': 'General Physician',
  'Cold': 'General Physician',
  'Flu': 'General Physician'
};

export function allocateDoctor(
  symptoms: string[],
  priority: 'Low' | 'Medium' | 'High' | 'Critical',
  currentQueue: Patient[],
  severity?: 'Mild' | 'Moderate' | 'Severe',
  transcript?: string,
  suggestedSpecialty?: string
): { doctor: Doctor; score: number; reason: string } {
  // 1. Determine required specialty
  let requiredSpecialty = 'General Physician';
  
  if (suggestedSpecialty && SPECIALTIES.includes(suggestedSpecialty)) {
    requiredSpecialty = suggestedSpecialty;
  } else {
    const specialtyCounts: Record<string, number> = {};
    symptoms.forEach(symptom => {
      // Basic NLP matching (case insensitive, partial match)
      let matchedSpecialty = 'General Physician';
      for (const [key, spec] of Object.entries(SYMPTOM_TO_SPECIALTY)) {
        if (symptom.toLowerCase().includes(key.toLowerCase())) {
          matchedSpecialty = spec;
          break;
        }
      }
      specialtyCounts[matchedSpecialty] = (specialtyCounts[matchedSpecialty] || 0) + 1;
    });

    let maxCount = 0;
    Object.entries(specialtyCounts).forEach(([specialty, count]) => {
      if (count > maxCount) {
        maxCount = count;
        requiredSpecialty = specialty;
      }
    });
  }

  // 2. Calculate current load for each doctor
  const doctorLoads: Record<string, number> = {};
  DOCTORS.forEach(d => doctorLoads[d.id] = 0);
  
  currentQueue.forEach(patient => {
    // Try to extract doctor ID or name
    const docNameMatch = patient.assignedDoctor.match(/^(Dr\. [^(]+)/);
    if (docNameMatch) {
      const docName = docNameMatch[1].trim();
      const doctor = DOCTORS.find(d => d.name === docName);
      if (doctor) {
        // Critical patients contribute more to the perceived load
        const loadWeight = patient.priority === 'Critical' ? 3 : patient.priority === 'High' ? 2 : 1;
        doctorLoads[doctor.id] += loadWeight;
      }
    }
  });

  // 3. Score and rank doctors
  let bestDoctor = DOCTORS.find(d => d.specialty === 'General Physician') || DOCTORS[0];
  let bestScore = -Infinity;
  let allocationReason = '';

  // Filter available doctors first
  const availableDoctors = DOCTORS.filter(d => d.status === 'Available');
  
  // If no doctors available, fallback to all doctors
  const candidateDoctors = availableDoctors.length > 0 ? availableDoctors : DOCTORS;

  candidateDoctors.forEach(doctor => {
    let score = 100;
    const isSpecialtyMatch = doctor.specialty === requiredSpecialty;
    const load = doctorLoads[doctor.id] || 0;

    // Factor A: Specialization Match (+100 points)
    if (isSpecialtyMatch) {
      score += 100;
    } else if (doctor.specialty === 'General Physician') {
      // General Physician is an acceptable fallback
      score += 20;
    } else {
      // Wrong specialty penalty
      score -= 100;
    }

    // Factor B: Current Patient Load Penalty
    // Heavily penalize assigning to a doctor with a high load
    let urgencyMultiplier = priority === 'Critical' ? 3 : priority === 'High' ? 2 : 1;
    
    // Adjust urgency based on severity
    if (severity === 'Severe') urgencyMultiplier *= 1.5;
    else if (severity === 'Mild') urgencyMultiplier *= 0.8;

    score -= (load * 15 * urgencyMultiplier);
    
    // Factor C: Experience Bonus (slight preference for more experienced doctors for critical cases)
    if (priority === 'Critical' || priority === 'High') {
      score += (doctor.experience * 0.5);
    }

    // Add slight randomness to distribute load among equally scored doctors
    score += Math.random() * 5;

    if (score > bestScore) {
      bestScore = score;
      bestDoctor = doctor;
      
      allocationReason = isSpecialtyMatch 
        ? `Matched specialty (${requiredSpecialty}) with optimal load (Load: ${load})`
        : `Fallback to ${doctor.specialty} due to load/availability (Load: ${load})`;
    }
  });

  return { doctor: bestDoctor, score: bestScore, reason: allocationReason };
}
