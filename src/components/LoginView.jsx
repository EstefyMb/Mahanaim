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
  // Empty by default per user request - team enters credentials themselves
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña para continuar.');
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

  const handleGoogleLogin = () => {
    setError('');
    setIsGoogleLoading(true);

    // Simulate Google OAuth Sign-in with church team account
    setTimeout(() => {
      setIsGoogleLoading(false);
      const googleUserEmail = email.trim() || churchSettings?.sharedEmail || 'ministerio.alabanza@gmail.com';
      onLogin({
        email: googleUserEmail,
        userName: churchSettings?.name || 'Equipo de Alabanza (Google)',
        rememberSession: true
      });
    }, 600);
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
            disabled={isLoading || isGoogleLoading}
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

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-slate-200 dark:border-midnight-800 w-full absolute" />
            <span className="bg-white dark:bg-midnight-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative z-10">
              o continuar con
            </span>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-bold text-sm bg-white dark:bg-midnight-950 hover:bg-slate-50 dark:hover:bg-midnight-850 active:scale-[0.99] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-midnight-800 shadow-sm transition-all disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span>Conectando con Google...</span>
              </span>
            ) : (
              <>
                {/* Official Google 'G' SVG icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Iniciar sesión con Google</span>
              </>
            )}
          </button>
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
