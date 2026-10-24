import React, { useState } from 'react';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Sun, 
  Moon, 
  Music2, 
  CheckCircle2, 
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import ChurchEmblem from './ChurchEmblem';

export default function LoginView({
  churchSettings,
  theme,
  onToggleTheme,
  onLogin
}) {
  const [email, setEmail] = useState(churchSettings?.sharedEmail || 'equipo@alabanza.org');
  const [password, setPassword] = useState('worship2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa correo y contraseña.');
      return;
    }

    setIsLoading(true);

    // Simulate instant authenticating with persistent session
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        email: email.trim(),
        userName: churchSettings?.name || 'Equipo de Alabanza',
        rememberSession
      });
    }, 450);
  };

  const handleQuickDemoLogin = () => {
    setEmail(churchSettings?.sharedEmail || 'equipo@alabanza.org');
    setPassword('worship2026');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        email: churchSettings?.sharedEmail || 'equipo@alabanza.org',
        userName: churchSettings?.name || 'Equipo de Alabanza',
        rememberSession: true
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-midnight-950 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden select-none">
      
      {/* Background celestial ambient lights */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 dark:bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          title={`Cambiar a ${theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}`}
          className="p-2.5 rounded-2xl bg-white dark:bg-midnight-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-midnight-800 shadow-sm hover:scale-105 transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-midnight-900/90 border border-slate-200 dark:border-midnight-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all relative z-10">
        
        {/* Church Identity Header */}
        <div className="text-center pb-6 border-b border-slate-100 dark:border-midnight-800">
          <div className="flex justify-center mb-3">
            <ChurchEmblem settings={churchSettings} size="lg" className="shadow-2xl shadow-indigo-600/30 ring-2 ring-indigo-500/30" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {churchSettings?.name || 'Worship Manager'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {churchSettings?.subtitle || 'Portal del Ministerio de Alabanza & Adoración'}
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sesión Compartida Permanente</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="pt-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Correo del Equipo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="equipo@alabanza.org"
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contraseña de Acceso
              </label>
              <span className="text-[11px] text-slate-400">Compartida</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember session checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 dark:border-midnight-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 select-none font-medium">
                Mantener sesión abierta en este atril/celular
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white shadow-xl shadow-indigo-600/30 transition-all border border-indigo-400/20 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Accediendo al repertorio...</span>
              </span>
            ) : (
              <>
                <span>Iniciar Sesión de Equipo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* 1-Click Fast Enter for Team */}
          <div className="pt-2">
            
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-midnight-800/80 text-center text-[11px] text-slate-400">
          <p>
            Plataforma centralizada con persistencia activa para músicos, directores y sonidistas.
          </p>
        </div>
      </div>
    </div>
  );
}
