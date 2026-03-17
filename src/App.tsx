import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { PatientId } from './pages/PatientId';
import { VoiceIntake } from './pages/VoiceIntake';
import { Triage } from './pages/Triage';
import { Navigation } from './pages/Navigation';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { Layout } from './components/Layout';

function App() {
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
