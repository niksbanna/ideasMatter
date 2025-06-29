import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lightbulb, Users, PlusCircle, BarChart3, LogIn, Shield, Search } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { AuthModal } from './AuthModal';
import { StaticLanguageSelector } from './StaticLanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { isAuthenticated, getCurrentUser } from '../services/auth';

interface NavbarProps {
  onAuthChange?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthChange }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [searchTerm, setSearchTerm] = useState('');

  const isActive = (path: string) => location.pathname === path;
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.email === 'admin@ideasmatter.com' || currentUser?.user_metadata?.role === 'admin';

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to home with search parameter
      window.location.href = `/?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
              <Lightbulb className="h-8 w-8" />
              <span>IdeasMatter</span>
            </Link>
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search ideas, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                />
              </form>
            </div>
            
            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
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

              {/* Admin Link - Only show for admin users */}
              {authenticated && isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin') 
                      ? 'bg-red-100 text-red-600' 
                      : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <StaticLanguageSelector />
              
              {/* Auth Section */}
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

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </form>
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