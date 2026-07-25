import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle, Chrome } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (user: any) => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signup',
  onAuthSuccess,
  onSwitchMode,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side quick checks
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-offwhite">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-200 shadow-card">
        {/* Header Toggle */}
        <div className="flex bg-navy-50 p-1 rounded-xl mb-6 border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              onSwitchMode('signup');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-navy-900 text-offwhite shadow-sm'
                : 'text-gray-600 hover:text-navy-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              onSwitchMode('login');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-navy-900 text-offwhite shadow-sm'
                : 'text-gray-600 hover:text-navy-900'
            }`}
          >
            Sign In
          </button>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold font-display text-navy-900">
            {mode === 'signup' ? 'Get Started with LandingIQ' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'signup'
              ? 'Start running instant AI landing page audits in seconds'
              : 'Sign in to access your audit dashboard and saved reports'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 bg-offwhite border border-gray-300 rounded-lg text-sm text-navy-900 focus:ring-2 focus:ring-amber focus:border-amber transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 8 characters' : 'Enter password'}
                className="w-full pl-9 pr-3 py-2.5 bg-offwhite border border-gray-300 rounded-lg text-sm text-navy-900 focus:ring-2 focus:ring-amber focus:border-amber transition-all"
              />
            </div>
            {mode === 'signup' && (
              <p className="text-[11px] text-gray-500 mt-1">Must be at least 8 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-offwhite font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-amber" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-3">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs font-medium text-gray-400 uppercase">Or continue with</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        {/* Google OAuth Option */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-semibold text-navy-900 flex items-center justify-center space-x-2 transition-colors"
        >
          <Chrome className="w-4 h-4 text-blue-600" />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};
