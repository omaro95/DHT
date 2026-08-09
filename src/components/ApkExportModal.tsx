import React, { useState } from 'react';
import { Smartphone, Github, Download, Check, Copy, ExternalLink, X, Shield, Terminal, ArrowRight, Sparkles } from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'github' | 'local'>('pwa');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ambient Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-slate-800 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-100 tracking-wide flex items-center gap-2">
              ANDROID APK & MOBILE APP
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold uppercase">
                Capacitor & PWA Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Transfer to GitHub to generate your compiled APK file, or install directly as an Android PWA.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-5 text-xs">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'pwa'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Direct App Install</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'github'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>2. GitHub APK Auto-Build</span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'local'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Local Android Build</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto pr-1 space-y-4 text-slate-300 text-sm flex-1">
          {activeTab === 'pwa' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Mobile App Installation (No APK compilation needed!)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This web app is configured with Web Manifest and PWA service metadata. You can install TEMPORAL directly onto your Android home screen as a standalone mobile app icon.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  How to Install on Android Phone:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                  <li className="pl-1">Open this app URL in <strong className="text-slate-100">Chrome or Edge on Android</strong>.</li>
                  <li className="pl-1">Tap the top-right <strong className="text-amber-400">Menu (⋮)</strong> icon in Chrome.</li>
                  <li className="pl-1">Select <strong className="text-amber-400">"Add to Home screen"</strong> or <strong className="text-amber-400">"Install app"</strong>.</li>
                  <li className="pl-1">Confirm installation — TEMPORAL will now launch as a native standalone app on your Android device!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Github className="w-4 h-4" />
                  <span>Automated GitHub Actions APK Build</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We have added a pre-configured GitHub Actions workflow (<code className="text-sky-300 font-mono bg-slate-950 px-1 py-0.5 rounded">.github/workflows/android-apk.yml</code>) to this repository. When you transfer code to GitHub, GitHub automatically builds the <strong className="text-sky-300">.apk file</strong> for download!
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  3-Step GitHub Export Guide:
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="bg-sky-500 text-slate-950 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px]">1</span>
                    <div>
                      <p className="font-semibold text-slate-100">Export to GitHub from AI Studio</p>
                      <p className="text-[11px] text-slate-400">Click top-right <strong className="text-slate-200">Settings/Export Menu &gt; Export to GitHub</strong>.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="bg-sky-500 text-slate-950 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px]">2</span>
                    <div>
                      <p className="font-semibold text-slate-100">GitHub Actions Builds the APK</p>
                      <p className="text-[11px] text-slate-400">In your GitHub repository, open the <strong className="text-slate-200">Actions tab</strong>. The <strong className="text-sky-400">Build Android APK</strong> workflow will compile your APK automatically.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="bg-sky-500 text-slate-950 font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[11px]">3</span>
                    <div>
                      <p className="font-semibold text-slate-100">Download .apk File to Android Phone</p>
                      <p className="text-[11px] text-slate-400">Click on the completed build run, scroll down to <strong className="text-emerald-400">Artifacts</strong>, and download <code className="text-amber-300 bg-slate-950 px-1 rounded">TEMPORAL-SunTracker-App-debug.apk</code> directly onto your phone!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>Local Capacitor Android Build Commands</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you clone your repository locally to your computer, Capacitor dependencies and configuration (<code className="text-emerald-300 font-mono bg-slate-950 px-1 py-0.5 rounded">capacitor.config.json</code>) are already set up.
                </p>
              </div>

              <div className="space-y-3">
                {/* Command 1 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 font-semibold">1. Sync Web App with Capacitor</span>
                    <button
                      onClick={() => handleCopy('npm run cap:sync', 'cmd1')}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800"
                    >
                      {copiedCmd === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCmd === 'cmd1' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="block bg-slate-900 p-2 rounded text-xs font-mono text-amber-300">
                    npm run cap:sync
                  </code>
                </div>

                {/* Command 2 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 font-semibold">2. Generate & Open Android Studio Project</span>
                    <button
                      onClick={() => handleCopy('npm run cap:android', 'cmd2')}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800"
                    >
                      {copiedCmd === 'cmd2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCmd === 'cmd2' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="block bg-slate-900 p-2 rounded text-xs font-mono text-amber-300">
                    npm run cap:android
                  </code>
                </div>

                {/* Command 3 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 font-semibold">3. Compile APK directly via Command Line</span>
                    <button
                      onClick={() => handleCopy('cd android && ./gradlew assembleDebug', 'cmd3')}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800"
                    >
                      {copiedCmd === 'cmd3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCmd === 'cmd3' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="block bg-slate-900 p-2 rounded text-xs font-mono text-amber-300">
                    cd android && ./gradlew assembleDebug
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Capacitor v8 Android Integration Complete
          </span>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
