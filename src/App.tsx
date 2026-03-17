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
    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;

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

    const suppressWebSocketLog = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('WebSocketInterceptor')) {
        return;
      }
      originalConsoleLog(...args);
    };

    console.log = suppressWebSocketLog;
    console.info = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('WebSocketInterceptor')) {
        return;
      }
      originalConsoleInfo(...args);
    };

    // Handle unhandled promise rejections (like the SW fetch error)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof TypeError && event.reason.message === 'Failed to fetch') {
        event.preventDefault(); // Prevent it from showing up as an uncaught error
        console.warn('Caught and suppressed a benign network fetch error (likely from Service Worker).');
      } else if (event.reason instanceof DOMException && event.reason.name === 'InvalidStateError' && event.reason.message.includes('Only the active worker can claim clients')) {
        event.preventDefault();
        console.warn('Caught and suppressed a benign Service Worker state error.');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
      console.info = originalConsoleInfo;
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
