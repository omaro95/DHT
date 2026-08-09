import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Copy, Check, ExternalLink, X, ShieldAlert, UserCheck } from 'lucide-react';

export const AuthErrorModal: React.FC = () => {
  const { authError, clearAuthError, signInAsGuest } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!authError) return null;

  const currentDomain = authError.domain || (typeof window !== 'undefined' ? window.location.hostname : '');
  const isUnauthorizedDomain = authError.code === 'auth/unauthorized-domain' || authError.message.includes('unauthorized-domain');

  const handleCopyDomain = () => {
    if (currentDomain) {
      navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-sky-500" />

        {/* Close Button */}
        <button
          onClick={clearAuthError}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {isUnauthorizedDomain ? 'Firebase Domain Authorization Needed' : 'Authentication Notice'}
            </h3>
            <p className="text-xs text-amber-300 font-mono mt-0.5">{authError.code}</p>
          </div>
        </div>

        {isUnauthorizedDomain ? (
          <div className="space-y-4 text-sm text-slate-300">
            <p className="leading-relaxed">
              Firebase Authentication blocks OAuth requests from new app domains until they are whitelisted in your Firebase Console.
            </p>

            {/* Current Domain Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Your App Domain</span>
                <span className="font-mono text-xs text-sky-400 truncate block">{currentDomain}</span>
              </div>
              <button
                onClick={handleCopyDomain}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs space-y-2">
              <span className="font-semibold text-slate-200 block">How to authorize this domain (1 min):</span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                <li>Go to <strong className="text-slate-200">Firebase Console &gt; Authentication &gt; Settings</strong></li>
                <li>Select the <strong className="text-slate-200">Authorized domains</strong> tab</li>
                <li>Click <strong className="text-slate-200">Add domain</strong> and paste <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">{currentDomain}</code></li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Firebase Console</span>
              </a>

              <button
                onClick={() => {
                  clearAuthError();
                  signInAsGuest();
                }}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Sign In as Guest</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-slate-300">
            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono break-all">
              {authError.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={clearAuthError}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
