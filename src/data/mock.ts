import type { AppState, Patient, DoctorPatient, ChatMessage } from '@/types';

const today = new Date();
const iso = (d: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - d);
  return dt.toISOString().slice(0, 10);
};

const sarah: Patient = {
  id: 'p1',
  name: 'Sarah Johnson',
  age: 34,
  gender: 'Female',
  surgeryType: 'Knee Arthroscopy',
  surgeryDate: iso(9),
  recoveryDay: 9,
  recoveryScore: 82,
  risk: 'low',
  avatar: 'https://images.pexels.com/photos/599845/pexels-photo-599845.jpeg?auto=compress&w=200',
  vitals: {
    heartRate: 72,
    bloodPressure: '120/80',
    temperature: 98.6,
    oxygen: 98,
    steps: 6420,
    sleepHours: 7.5,
    syncedVia: 'Apple Watch',
    lastSync: '2 min ago',
  },
  medications: [
    { id: 'm1', name: 'Ibuprofen', dosage: '400mg', time: '14:30', instructions: 'After meals', taken: false },
    { id: 'm2', name: 'Amoxicillin', dosage: '500mg', time: '08:00', instructions: 'Empty stomach', taken: true },
    { id: 'm3', name: 'Cetirizine', dosage: '10mg', time: '21:00', instructions: 'Before bed', taken: false },
  ],
  checkIns: [
    { id: 'c1', date: iso(0), pain: 3, mood: 4, energy: 4, sleep: 4, symptoms: ['Fatigue'], note: 'Feeling better today.' },
    { id: 'c2', date: iso(1), pain: 4, mood: 3, energy: 3, sleep: 3, symptoms: ['Headache', 'Fatigue'] },
    { id: 'c3', date: iso(2), pain: 5, mood: 3, energy: 2, sleep: 3, symptoms: ['Swelling'] },
    { id: 'c4', date: iso(3), pain: 6, mood: 2, energy: 2, sleep: 2, symptoms: ['Swelling', 'Redness'] },
    { id: 'c5', date: iso(4), pain: 7, mood: 2, energy: 1, sleep: 2, symptoms: ['Fever', 'Swelling'] },
    { id: 'c6', date: iso(5), pain: 8, mood: 1, energy: 1, sleep: 1, symptoms: ['Fever', 'Nausea'] },
    { id: 'c7', date: iso(6), pain: 8, mood: 1, energy: 1, sleep: 1, symptoms: ['Fever', 'Nausea', 'Redness'] },
  ],
  streak: 7,
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Peanuts'],
  emergencyContacts: [
    { name: 'Mark Johnson', phone: '+1 555 010 2233', relation: 'Spouse' },
    { name: 'Emily Johnson', phone: '+1 555 010 4455', relation: 'Sister' },
  ],
  insurance: 'BlueCross BlueShield #BC-992311',
  medicalHistory: ['2019: Appendectomy', '2021: Mild Hypertension', '2024: Knee Arthroscopy'],
  nextAppointment: { doctor: 'Dr. Michael Chen', date: 'Tomorrow', time: '10:30 AM', type: 'Video Call' },
};

const patients: Patient[] = [sarah];

const doctorPatients: DoctorPatient[] = [
  {
    id: 'p1', name: 'Sarah Johnson', age: 34, surgeryType: 'Knee Arthroscopy', recoveryDay: 9,
    recoveryScore: 82, risk: 'low', avatar: sarah.avatar,
    recentVitals: { heartRate: 72, bp: '120/80', temp: 98.6, oxygen: 98 },
    lastCheckIn: '2 hrs ago',
  },
  {
    id: 'p2', name: 'Robert Adams', age: 58, surgeryType: 'Coronary Bypass', recoveryDay: 5,
    recoveryScore: 64, risk: 'high', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&w=200',
    recentVitals: { heartRate: 96, bp: '145/92', temp: 100.4, oxygen: 94 },
    lastCheckIn: '5 hrs ago', flagged: true,
  },
  {
    id: 'p3', name: 'Maria Garcia', age: 41, surgeryType: 'Laparoscopic Cholecystectomy', recoveryDay: 12,
    recoveryScore: 78, risk: 'moderate', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=200',
    recentVitals: { heartRate: 80, bp: '128/84', temp: 99.1, oxygen: 96 },
    lastCheckIn: '1 day ago',
  },
  {
    id: 'p4', name: 'James Wilson', age: 67, surgeryType: 'Hip Replacement', recoveryDay: 18,
    recoveryScore: 91, risk: 'low', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&w=200',
    recentVitals: { heartRate: 70, bp: '118/76', temp: 98.4, oxygen: 97 },
    lastCheckIn: '3 hrs ago',
  },
  {
    id: 'p5', name: 'Linda Brown', age: 52, surgeryType: 'Mastectomy', recoveryDay: 7,
    recoveryScore: 71, risk: 'high', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&w=200',
    recentVitals: { heartRate: 88, bp: '140/88', temp: 100.1, oxygen: 95 },
    lastCheckIn: '8 hrs ago', flagged: true,
  },
];

const chat: ChatMessage[] = [
  { id: '1', from: 'doctor', type: 'text', text: 'Hi Sarah, how are you feeling today after the procedure?', time: '09:14' },
  { id: '2', from: 'patient', type: 'text', text: 'Hi Dr. Chen, the pain has reduced quite a bit. Still some swelling.', time: '09:20' },
  { id: '3', from: 'doctor', type: 'image', image: 'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&w=400', text: 'Here is a knee exercise diagram. Try these twice a day.', time: '09:22' },
  { id: '4', from: 'patient', type: 'voice', voiceDuration: '0:18', time: '09:30' },
  { id: '5', from: 'doctor', type: 'text', text: 'Great. Keep icing the area and continue Ibuprofen. Let me know if fever returns.', time: '09:32' },
];

const alerts: AppState['alerts'] = [
  { id: 'a1', patientId: 'p2', type: 'Vitals', level: 'high', time: '5m ago', message: 'Heart rate spike 96 bpm + BP 145/92' },
  { id: 'a2', patientId: 'p5', type: 'Check-in', level: 'high', time: '2h ago', message: 'Reported fever 100.1°F and severe pain' },
  { id: 'a3', patientId: 'p3', type: 'Medication', level: 'moderate', time: '6h ago', message: 'Missed evening dose of Metformin' },
];

export const initialState: AppState = {
  role: 'patient',
  authed: false,
  darkMode: false,
  notifications: true,
  language: 'English',
  currentPatientId: 'p1',
  patients,
  doctorPatients,
  chat,
  alerts,
  voice: { voiceName: '', pitch: 1.05, rate: 0.95, wakeWord: 'Hey CareBridge', handsFree: false },
};
