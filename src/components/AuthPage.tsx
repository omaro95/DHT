import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sun,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
  Droplets,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  LogIn,
  UserPlus
} from 'lucide-react';

interface AuthPageProps {
  onContinueAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onContinueAsGuest }) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signInWithGoogle,
    signInAsGuest,
    authError,
    clearAuthError,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [localValidationMessage, setLocalValidationMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-sky-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 15, label: 'Too short', color: 'bg-rose-500' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalValidationMessage(null);
    setResetSuccessMessage(null);

    if (!email.trim()) {
      setLocalValidationMessage('Please enter a valid email address.');
      return;
    }

    if (authMode === 'forgot') {
      setIsSubmitting(true);
      const ok = await resetPassword(email.trim());
      setIsSubmitting(false);
      if (ok) {
        setResetSuccessMessage(`Password reset link has been dispatched to ${email.trim()}. Please check your inbox.`);
      }
      return;
    }

    if (!password) {
      setLocalValidationMessage('Please enter your password.');
      return;
    }

    if (authMode === 'signup') {
      if (password.length < 6) {
        setLocalValidationMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalValidationMessage('Passwords do not match. Please re-enter.');
        return;
      }

      setIsSubmitting(true);
      await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
      setIsSubmitting(false);
    } else {
      // Sign in
      setIsSubmitting(true);
      await signInWithEmail(email.trim(), password);
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    clearAuthError();
    setLocalValidationMessage(null);
    setIsSubmitting(true);
    await signInWithGoogle();
    setIsSubmitting(false);
  };

  const handleGuestAuth = async () => {
    clearAuthError();
    setLocalValidationMessage(null);
    setIsSubmitting(true);
    const ok = await signInAsGuest();
    setIsSubmitting(false);
    if (ok && onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background Decorative Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Form Box Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl relative z-10">
        
        {/* Left Side: Brand Showcase & Value Pillars */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            {/* Logo Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-sky-400 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider text-slate-100 uppercase">
                  TEMPORAL
                </h1>
                <p className="text-[11px] text-amber-400 font-semibold tracking-wide">
                  Roadmap & Solar Tracker
                </p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-100 leading-tight">
                Master your day with astronomical clarity.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in to securely synchronize your personal health logs, hydration levels, meal timestamps, and 180° Solar Clock roadmaps across all your devices.
              </p>
            </div>

            {/* Feature Badges List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">180° Real-time Sun Clock</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Calculates Solar Noon Zenith and daylight milestones for your coordinates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Hydration & Restroom Journal</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Track water intake ml, meal nutrition stamps, and restroom frequency.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Mon/Thu Anchor Roadmap</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dual-day anchor framework highlighting weekly focus and reflections.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Firebase Secured
            </span>
            <span>Cloud Database Sync</span>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          
          {/* Header Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  clearAuthError();
                  setLocalValidationMessage(null);
                  setResetSuccessMessage(null);
                }}
                className={`flex-1 sm:flex-initial py-2 px-5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  clearAuthError();
                  setLocalValidationMessage(null);
                  setResetSuccessMessage(null);
                }}
                className={`flex-1 sm:flex-initial py-2 px-5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>

            {authMode === 'forgot' && (
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Back to Sign In
              </button>
            )}
          </div>

          {/* Form Title & Subtitle */}
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-100 tracking-tight">
              {authMode === 'signup'
                ? 'Create your Temporal Account'
                : authMode === 'signin'
                ? 'Welcome back to Temporal'
                : 'Reset your Account Password'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {authMode === 'signup'
                ? 'Enter your details to start tracking habits and solar trajectories.'
                : authMode === 'signin'
                ? 'Enter your registered email and password to access your dashboard.'
                : 'We will send a password reset link to your email address.'}
            </p>
          </div>

          {/* Alert Message Banners */}
          {localValidationMessage && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{localValidationMessage}</span>
            </div>
          )}

          {authError && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">{authError.message}</p>
                <p className="text-[10px] text-rose-400/80 mt-0.5 font-mono">Code: {authError.code}</p>
              </div>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-300 flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Core Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display Name (Only in Sign Up mode) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Password (for Sign In & Sign Up) */}
            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        clearAuthError();
                        setLocalValidationMessage(null);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter (On Signup) */}
                {authMode === 'signup' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-semibold text-slate-300">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Only in Sign Up) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : authMode === 'signup'
                  ? 'Complete Sign Up & Open Dashboard'
                  : authMode === 'signin'
                  ? 'Sign In to Dashboard'
                  : 'Send Password Reset Email'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Or continue with
            </span>
          </div>

          {/* Alternative Quick Auth Actions: Google & Guest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google Account</span>
            </button>

            <button
              type="button"
              onClick={handleGuestAuth}
              disabled={isSubmitting}
              className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Explore Demo as Guest</span>
            </button>
          </div>

          {/* Terms / Privacy notice */}
          <p className="text-[10px] text-slate-500 text-center mt-6">
            By signing up or logging in, your data is securely stored in your private Firebase Firestore account.
          </p>
        </div>

      </div>
    </div>
  );
};
