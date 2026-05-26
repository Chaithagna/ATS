import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ImprovementPage from './pages/ImprovementPage';
import InterviewPage from './pages/InterviewPage';
import RecruiterPage from './pages/RecruiterPage';
import SettingsPage from './pages/SettingsPage';

// Import Components
import Sidebar from './components/Sidebar';

// Decoupled component to sync database cloud themes into current visual session
const ThemeSync = () => {
  const { user } = useAuth();
  const { theme, changeTheme } = useTheme();

  React.useEffect(() => {
    if (user?.settings?.theme && user.settings.theme !== theme) {
      changeTheme(user.settings.theme);
    }
  }, [user, theme, changeTheme]);

  return null;
};

// Protected Route Component Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-xs font-mono text-cyber-cyan animate-pulse relative">
        <div className="cyber-bg" />
        <div className="cyber-bg-glow-3" />
        Initializing MERN Security layers...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Main Layout Wrapper
const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background relative transition-colors duration-700">
      {/* Dynamic Animated Mesh Backdrops */}
      <div className="cyber-bg" />
      <div className="cyber-bg-glow-3" />
      
      {/* Navigation */}
      <Sidebar />
      
      {/* Visual canvas layout panel */}
      <main className="flex-1 min-w-0 overflow-y-auto relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/improve" element={<ImprovementPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/recruiter" element={<RecruiterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeSync />
        <Router>
          <Routes>
            {/* Public show landing and sign up portals */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Main App protected dashboard endpoints */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
