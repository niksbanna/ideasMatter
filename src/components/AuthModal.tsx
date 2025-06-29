import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { signUp, signIn } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpEmail, setSignUpEmail] = useState(''); // Store email for verification screen

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setShowPassword(false);
    // Don't clear signUpEmail here - we need it for the verification screen
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setShowPassword(false);
    setSignUpEmail(''); // Only clear signUpEmail when actually closing the modal
    setMode(initialMode);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { user, error } = await signUp({ email, password, fullName });
        if (error) {
          setError(error);
        } else {
          // Store the email before clearing the form
          setSignUpEmail(email);
          setMode('verify');
          resetForm(); // This will clear the form but preserve signUpEmail
        }
      } else if (mode === 'signin') {
        const { user, error } = await signIn({ email, password });
        if (error) {
          setError(error);
        } else if (user) {
          onSuccess();
          handleClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    if (mode === 'verify') {
      setMode('signin');
    } else {
      setMode(mode === 'signin' ? 'signup' : 'signin');
    }
    setError('');
  };

  const handleBackToSignIn = () => {
    setMode('signin');
    setError('');
  };

  if (!isOpen) return null;

  // Email Verification Screen
  if (mode === 'verify') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Check Your Email
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-blue-900 font-medium mb-2">Account Created Successfully!</p>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    We've sent a verification email to:
                  </p>
                  <p className="text-blue-900 font-medium text-sm mt-1 bg-blue-100 px-2 py-1 rounded">
                    {signUpEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-slate-600 text-sm space-y-3 mb-8">
              <p>
                <strong>Before you can sign in:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 text-left bg-slate-50 p-4 rounded-lg">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here to sign in with your credentials</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBackToSignIn}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue to Sign In
              </button>
              
              <p className="text-slate-500 text-sm">
                Didn't receive the email?{' '}
                <button 
                  onClick={() => setError('Please check your spam folder or contact support')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Get Help
                </button>
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sign In / Sign Up Form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-600">
            {mode === 'signin' 
              ? 'Sign in to submit ideas and engage with the community' 
              : 'Join IdeasMatter to start sharing your policy ideas'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
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
                  required={mode === 'signup'}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-slate-500 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-800 text-sm">
                  <p className="font-medium mb-1">Email Verification Required</p>
                  <p>After creating your account, you'll need to verify your email address before you can sign in.</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};