import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAsAdmin } = useStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    setIsLoggingIn(true);
    // Simulate network delay for OAuth flow
    setTimeout(() => {
      loginAsAdmin();
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Director Access</h2>
        <p className="text-slate-500 mb-8">
          Please sign in with your authorized Google Workspace account to access the dashboard.
        </p>
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 shadow-sm"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}
        </button>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 text-left">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Demo Note:</strong> This is a simulated login screen. In a production environment, this button would trigger a real Google OAuth2 flow to verify your identity against the school's Google Workspace directory before granting access.
          </p>
        </div>
      </div>
    </div>
  );
};
