import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, FileText, ChevronDown, Settings } from 'lucide-react';
import { signOut, getCurrentUser } from '../services/auth';

interface UserDropdownProps {
  onSignOut: () => void;
  onOpenAuthModal?: (mode: 'signin' | 'signup') => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ onSignOut, onOpenAuthModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = getCurrentUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut();
      setIsOpen(false);
      
      // Open the sign-in modal after signing out
      if (onOpenAuthModal) {
        // Small delay to ensure the auth state has updated
        setTimeout(() => {
          onOpenAuthModal('signin');
        }, 100);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {getInitials()}
        </div>
        <span className="hidden md:block text-slate-700 font-medium">
          {getDisplayName()}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="font-semibold text-slate-900">{getDisplayName()}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>
          
          <div className="py-2">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>My Ideas</span>
            </Link>
            
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </div>
          
          <div className="border-t border-slate-200 pt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};