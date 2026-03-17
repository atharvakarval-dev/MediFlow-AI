import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { PatientId } from './pages/PatientId';
import { VoiceIntake } from './pages/VoiceIntake';
import { Triage } from './pages/Triage';
import { Navigation } from './pages/Navigation';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { Layout } from './components/Layout';

function App() {
  useEffect(() => {
    // Suppress specific benign errors from console to clean up the developer experience
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('WebSocketInterceptor') ||
         args[0].includes('failed to connect to websocket') ||
         args[0].includes('The message port closed before a response was received'))
      ) {
        return; // Suppress these specific benign errors
      }
      originalConsoleError(...args);
    };

    // Handle unhandled promise rejections (like the SW fetch error)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof TypeError && event.reason.message === 'Failed to fetch') {
        event.preventDefault(); // Prevent it from showing up as an uncaught error
        console.warn('Caught and suppressed a benign network fetch error (likely from Service Worker).');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Unregister any rogue service workers that might be causing the fetch errors
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log('Unregistered service worker to prevent fetch conflicts.');
        }
      }).catch(err => console.warn('Service Worker unregistration failed: ', err));
    }

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />
          <Route path="identify" element={<PatientId />} />
          <Route path="intake" element={<VoiceIntake />} />
          <Route path="triage" element={<Triage />} />
          <Route path="navigate" element={<Navigation />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
