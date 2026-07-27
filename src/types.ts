export type Role = 'patient' | 'doctor';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface Vitals {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  oxygen: number;
  steps: number;
  sleepHours: number;
  syncedVia: string;
  lastSync: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:MM
  instructions: string;
  taken: boolean;
  missed?: boolean;
}

export interface CheckInLog {
  id: string;
  date: string;
  pain: number;
  mood: number;
  energy: number;
  sleep: number;
  symptoms: string[];
  note?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  surgeryType: string;
  surgeryDate: string;
  recoveryDay: number;
  recoveryScore: number;
  risk: RiskLevel;
  avatar: string;
  vitals: Vitals;
  medications: Medication[];
  checkIns: CheckInLog[];
  streak: number;
  bloodGroup: string;
  allergies: string[];
  emergencyContacts: { name: string; phone: string; relation: string }[];
  insurance: string;
  medicalHistory: string[];
  nextAppointment: { doctor: string; date: string; time: string; type: string };
}

export interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  surgeryType: string;
  recoveryDay: number;
  recoveryScore: number;
  risk: RiskLevel;
  avatar: string;
  recentVitals: { heartRate: number; bp: string; temp: number; oxygen: number };
  lastCheckIn: string;
  flagged?: boolean;
}

export interface ChatMessage {
  id: string;
  from: 'patient' | 'doctor';
  type: 'text' | 'image' | 'voice';
  text?: string;
  image?: string;
  voiceDuration?: string;
  time: string;
}

export interface VoiceSettings {
  voiceName: string;
  pitch: number;
  rate: number;
  wakeWord: string;
  handsFree: boolean;
}

export interface AppState {
  role: Role;
  authed: boolean;
  darkMode: boolean;
  notifications: boolean;
  language: string;
  currentPatientId: string;
  patients: Patient[];
  doctorPatients: DoctorPatient[];
  chat: ChatMessage[];
  alerts: { id: string; patientId: string; type: string; level: RiskLevel; time: string; message: string }[];
  voice: VoiceSettings;
}
