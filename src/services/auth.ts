import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Auth state management
let currentUser: AuthUser | null = null;
let currentSession: Session | null = null;

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  return currentUser;
};

// Get current session
export const getCurrentSession = (): Session | null => {
  return currentSession;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!currentUser && !!currentSession;
};

// Initialize auth state
export const initializeAuth = async (): Promise<{ user: AuthUser | null; session: Session | null }> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { user: null, session: null };
    }

    if (session?.user) {
      currentUser = {
        id: session.user.id,
        email: session.user.email || '',
        user_metadata: session.user.user_metadata
      };
      currentSession = session;
    } else {
      currentUser = null;
      currentSession = null;
    }

    return { user: currentUser, session: currentSession };
  } catch (error) {
    console.error('Error initializing auth:', error);
    return { user: null, session: null };
  }
};

// Sign up with email and password
export const signUp = async ({ email, password, fullName }: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('User already registered')) {
        return { user: null, error: 'An account with this email already exists. Please sign in instead.' };
      } else if (error.message.includes('Password should be at least')) {
        return { user: null, error: 'Password must be at least 6 characters long.' };
      } else if (error.message.includes('Invalid email')) {
        return { user: null, error: 'Please enter a valid email address.' };
      }
      return { user: null, error: error.message };
    }

    // Important: Don't automatically sign in the user after signup
    // They need to verify their email first
    if (data.user) {
      // Check if email confirmation is required
      if (!data.session && data.user && !data.user.email_confirmed_at) {
        // Email confirmation is required - user created but not signed in
        return { user: null, error: null }; // Success but no session yet
      } else if (data.session) {
        // Email confirmation is disabled - user is automatically signed in
        // We should still not sign them in automatically to maintain consistency
        await supabase.auth.signOut(); // Sign them out immediately
        return { user: null, error: null }; // Success but require email verification
      }
    }

    return { user: null, error: null }; // Success but no immediate session
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: 'An unexpected error occurred during sign up' };
  }
};

// Sign in with email and password
export const signIn = async ({ email, password }: SignInData): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        return { user: null, error: 'Invalid email or password. Please check your credentials and try again.' };
      } else if (error.message.includes('Email not confirmed')) {
        return { user: null, error: 'Please verify your email address before signing in. Check your inbox for a verification link.' };
      } else if (error.message.includes('Too many requests')) {
        return { user: null, error: 'Too many sign-in attempts. Please wait a moment and try again.' };
      }
      return { user: null, error: error.message };
    }

    if (data.user && data.session) {
      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        // Email not confirmed - sign them out and show error
        await supabase.auth.signOut();
        return { user: null, error: 'Please verify your email address before signing in. Check your inbox for a verification link.' };
      }

      currentUser = {
        id: data.user.id,
        email: data.user.email || '',
        user_metadata: data.user.user_metadata
      };
      currentSession = data.session;
      
      return { user: currentUser, error: null };
    }

    return { user: null, error: 'Sign in failed - please try again' };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: 'An unexpected error occurred during sign in' };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    currentUser = null;
    currentSession = null;
    
    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user && session.user.email_confirmed_at) {
      // Only set user if email is confirmed
      currentUser = {
        id: session.user.id,
        email: session.user.email || '',
        user_metadata: session.user.user_metadata
      };
      currentSession = session;
    } else {
      currentUser = null;
      currentSession = null;
    }
    
    callback(currentUser, currentSession);
  });
};

// Reset password
export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

// Update user profile
export const updateProfile = async (updates: { full_name?: string; avatar_url?: string }): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) {
      return { error: error.message };
    }

    // Update local user state
    if (currentUser) {
      currentUser.user_metadata = { ...currentUser.user_metadata, ...updates };
    }

    return { error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'An unexpected error occurred' };
  }
};