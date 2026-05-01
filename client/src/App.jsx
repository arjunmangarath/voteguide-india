import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Wizard = lazy(() => import('./pages/Wizard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
          <div className="text-saffron-400 animate-pulse text-sm">Loading…</div>
        </div>
      }>
        <Routes>
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/wizard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
