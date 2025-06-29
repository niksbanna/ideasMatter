import React, { useState, useEffect } from 'react';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentUser, updateProfile } from '../services/auth';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const Profile: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setEmail(user.email);
      setFullName(user.user_metadata?.full_name || '');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await updateProfile({ full_name: fullName });
      
      if (error) {
        setMessage(error);
        setMessageType('error');
      } else {
        setMessage('Profile updated successfully!');
        setMessageType('success');
      }
    } catch (err) {
      setMessage('An unexpected error occurred');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-600">Manage your account information</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Email cannot be changed. Contact support if you need to update your email.
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};