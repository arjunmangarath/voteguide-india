import { Suspense, lazy, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-white font-semibold mb-3">Something went wrong</p>
            <button
              onClick={() => window.location.reload()}
              className="text-saffron-400 text-sm hover:text-saffron-300 underline"
            >
              Reload the page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Wizard = lazy(() => import('./pages/Wizard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
