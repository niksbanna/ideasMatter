import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { SubmitIdea } from './pages/SubmitIdea';
import { Dashboard } from './pages/Dashboard';
import { Explorer } from './pages/Explorer';
import { ProposalView } from './pages/ProposalView';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthModal } from './components/AuthModal';
import { Chatbot } from './components/Chatbot';
import { LanguageProvider } from './contexts/LanguageContext';
import { VideoGenerationProvider } from './contexts/VideoGenerationContext';
import { initializeAuth, onAuthStateChange } from './services/auth';

function App() {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [authKey, setAuthKey] = useState(0); // Force re-render on auth changes
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Initialize auth state
    initializeAuth().then(() => {
      setIsAuthInitialized(true);
    });

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange(() => {
      setAuthKey(prev => prev + 1); // Force re-render
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleAuthChange = () => {
    setAuthKey(prev => prev + 1); // Force re-render
  };

  const handleOpenAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    handleAuthChange();
  };

  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <VideoGenerationProvider>
        <Router>
          <div key={authKey} className="min-h-screen bg-slate-50">
            <Navbar onAuthChange={handleAuthChange} />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/submit" 
                  element={
                    <ProtectedRoute onUnauthorized={() => handleOpenAuthModal('signin')}>
                      <SubmitIdea />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute onUnauthorized={() => handleOpenAuthModal('signin')}>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute onUnauthorized={() => handleOpenAuthModal('signin')}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute onUnauthorized={() => handleOpenAuthModal('signin')}>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/explorer" element={<Explorer />} />
                <Route path="/proposal/:id" element={<ProposalView />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Chatbot - Always available */}
            <Chatbot />
          </div>
        </Router>

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          initialMode={authMode}
        />
      </VideoGenerationProvider>
    </LanguageProvider>
  );
}

export default App;