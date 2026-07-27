import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { StoreProvider, useStore } from '@/store';
import { RouterProvider, useRouter } from '@/router';
import { ToastProvider } from '@/components/Toast';
import { BottomNav } from '@/components/BottomNav';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { MedicationReminder } from '@/components/MedicationReminder';
import { HandsFreeListener } from '@/components/HandsFreeListener';
import { HandsFreeToggle } from '@/components/HandsFreeToggle';
import { Splash, Onboarding } from '@/screens/Splash';
import { Login } from '@/screens/Login';
import { PatientHome } from '@/screens/patient/Home';
import { CheckIn } from '@/screens/patient/CheckIn';
import { Wearables } from '@/screens/patient/Wearables';
import { AIAnalysis } from '@/screens/patient/AIAnalysis';
import { Recovery } from '@/screens/patient/Recovery';
import { Medication } from '@/screens/patient/Medication';
import { SOS } from '@/screens/patient/SOS';
import { SymptomChecker } from '@/screens/patient/SymptomChecker';
import { AppointmentBooking } from '@/screens/patient/AppointmentBooking';
import { DoctorHome } from '@/screens/doctor/DoctorHome';
import { DoctorChat } from '@/screens/doctor/DoctorChat';
import { VideoCall } from '@/screens/doctor/VideoCall';
import { Profile } from '@/screens/Profile';
import { Settings } from '@/screens/Settings';
import { Admin } from '@/screens/Admin';

function Screens() {
  const { route } = useRouter();
  const { state } = useStore();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const noNav: string[] = ['splash', 'onboarding', 'login', 'video-call'];
  const showNav = state.authed && !noNav.includes(route);
  const showAssistant = state.authed && state.role === 'patient' && !noNav.includes(route) && route !== 'video-call';

  const render = () => {
    switch (route) {
      case 'splash': return <Splash />;
      case 'onboarding': return <Onboarding />;
      case 'login': return <Login />;
      case 'patient-home': return <PatientHome />;
      case 'checkin': return <CheckIn />;
      case 'wearables': return <Wearables />;
      case 'ai-analysis': return <AIAnalysis />;
      case 'recovery': return <Recovery />;
      case 'medication': return <Medication />;
      case 'sos': return <SOS />;
      case 'symptom-checker': return <SymptomChecker />;
      case 'book-appointment': return <AppointmentBooking />;
      case 'doctor-home': return <DoctorHome />;
      case 'doctor-telehealth':
      case 'doctor-chat': return <DoctorChat />;
      case 'video-call': return <VideoCall />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      case 'admin': return <Admin />;
      default: return <PatientHome />;
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {render()}
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav />}
      {showAssistant && <VoiceAssistant externalOpen={assistantOpen} onExternalOpenChange={setAssistantOpen} />}
      {state.authed && <MedicationReminder />}
      {state.authed && <HandsFreeToggle />}
      {showAssistant && <HandsFreeListener onWake={() => setAssistantOpen(true)} />}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <RouterProvider>
          <Screens />
        </RouterProvider>
      </ToastProvider>
    </StoreProvider>
  );
}
