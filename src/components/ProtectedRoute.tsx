import React from 'react';
import { isAuthenticated } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  onUnauthorized 
}) => {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-6">
            You need to be signed in to access this feature.
          </p>
          <button
            onClick={() => onUnauthorized?.()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};