import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lightbulb, Users, PlusCircle, BarChart3, LogIn } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { AuthModal } from './AuthModal';
import { StaticLanguageSelector } from './StaticLanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { isAuthenticated } from '../services/auth';

interface NavbarProps {
  onAuthChange?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthChange }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const isActive = (path: string) => location.pathname === path;
  const authenticated = isAuthenticated();

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onAuthChange?.();
  };

  const handleSignOut = () => {
    onAuthChange?.();
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
              <Lightbulb className="h-8 w-8" />
              <span>IdeasMatter</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                }`}
              >
                <span>{t('nav.home')}</span>
              </Link>
              
              {authenticated ? (
                <Link
                  to="/submit"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/submit') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{t('nav.shareIdea')}</span>
                
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{t('nav.shareIdea')}</span>
                </button>
              )}
              
              <Link
                to="/explorer"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/explorer') 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{t('nav.explore')}</span>
              </Link>
              
              {authenticated && (
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Static Language Selector */}
              <StaticLanguageSelector />
              
              {authenticated ? (
                <UserDropdown 
                  onSignOut={handleSignOut} 
                  onOpenAuthModal={openAuthModal}
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {t('nav.signIn')}
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('nav.signUp')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </>
  );
};