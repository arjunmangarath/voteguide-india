import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Wizard from './pages/Wizard';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/wizard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
