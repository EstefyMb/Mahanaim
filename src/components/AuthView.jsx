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
  Building2, 
  CheckCircle2, 
  Users,
  Eye,
  EyeOff,
  PlusCircle,
  HelpCircle,
  Flame,
  Layers,
  Globe
} from 'lucide-react';
import ChurchEmblem, { EMBLEM_PRESETS } from './ChurchEmblem';
import { multiTenantService } from '../services/multiTenantService';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';

export default function AuthView({
  theme,
  onToggleTheme,
  onLoginSuccess
}) {
  // Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Register form state
  const [churchName, setChurchName] = useState('');
  const [churchSubtitle, setChurchSubtitle] = useState('Ministerio de Alabanza');
  const [adminEmail, setAdminEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [logoType, setLogoType] = useState('preset'); // 'preset' | 'custom'
  const [logoPreset, setLogoPreset] = useState('harp');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [starterOption, setStarterOption] = useState('sample'); // 'sample' | 'empty'

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // List of existing tenants on this machine (for quick switching or demonstration)
  const existingTenants = multiTenantService.getAllTenants();

  // Handle Login con Firebase Cloud (Búsqueda automática y segura)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail || !loginPassword) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Validar correo y contraseña en Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
      const user = userCredential.user;

      // 2. Buscar automáticamente en Firestore el documento que pertenezca a este correo exacto
      const churchesRef = collection(db, 'churches');
      const q = query(churchesRef, where('settings.sharedEmail', '==', cleanEmail), limit(1));
      const querySnapshot = await getDocs(q);

      let churchId = '';
      let churchNameVal = 'Ministerio de Alabanza';

      if (!querySnapshot.empty) {
        const churchDoc = querySnapshot.docs[0];
        churchId = churchDoc.id;
        const data = churchDoc.data();
        if (data && data.settings && data.settings.name) {
          churchNameVal = data.settings.name;
        }
      } else {
        // Fallback robusto si por alguna razón el registro previo no vinculó el correo en settings
        const baseSlug = cleanEmail.split('@')[0].replace(/[^a-z0-9]+/g, '_');
        churchId = `church_${baseSlug}_${user.uid.substring(0, 6)}`;
      }

      const churchData = {
        id: churchId,
        name: churchNameVal,
        adminEmail: cleanEmail
      };

      const sessionData = {
        isAuthenticated: true,
        churchId: churchId,
        churchName: churchNameVal,
        adminEmail: cleanEmail,
        email: cleanEmail,
        rememberSession
      };

      setIsLoading(false);
      onLoginSuccess(sessionData, churchData);

    } catch (err) {
      setIsLoading(false);
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos. Verifica tus datos.');
      } else {
        setError('Error al iniciar sesión en la nube. Intenta de nuevo.');
      }
    }
  };

  // Handle Register New Church con Firebase (Guardado automático del correo real)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = adminEmail.trim().toLowerCase();

    if (!churchName.trim()) {
      setError('Por favor ingresa el nombre de la congregación o iglesia.');
      return;
    }
    if (!cleanEmail) {
      setError('Por favor ingresa el correo del administrador de la iglesia.');
      return;
    }
    if (!registerPassword || registerPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (registerPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, registerPassword);
      const user = userCredential.user;

      // 2. Generar ID único para la Firestore Database
      const baseSlug = churchName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_');
      const uniqueId = `church_${baseSlug}_${user.uid.substring(0, 6)}`;

      // 3. Guardar el documento inicial en Firestore asegurando que sharedEmail sea exactamente el correo ingresado
      await setDoc(doc(db, 'churches', uniqueId), {
        settings: {
          name: churchName.trim(),
          subtitle: churchSubtitle.trim(),
          logoType,
          logoPreset,
          customLogoUrl: customLogoUrl.trim(),
          sharedEmail: cleanEmail, // <--- Aquí se guarda de forma exacta el correo registrado
          sessionActive: true,
          sessionUser: 'Administrador'
        },
        songs: starterOption === 'sample' ? [
          {
            id: 'sample-1',
            title: 'Digno de Alabar',
            originalKey: 'G',
            category: 'Adoración',
            artist: 'Miel San Marcos',
            lyricsAndChords: '[G]Digno de alabar, [D/F#]Señor\n[Em]Manos alzo ante ti'
          }
        ] : [],
        slots: [],
        history: []
      });

      const tenantData = {
        id: uniqueId,
        name: churchName.trim(),
        adminEmail: cleanEmail
      };

      const sessionData = {
        isAuthenticated: true,
        churchId: uniqueId,
        churchName: churchName.trim(),
        adminEmail: cleanEmail,
        email: cleanEmail,
        rememberSession: true
      };

      setIsLoading(false);
      setSuccessMessage(`¡Iglesia "${churchName}" dada de alta en la nube exitosamente!`);
      
      setTimeout(() => {
        onLoginSuccess(sessionData, tenantData);
      }, 400);

    } catch (err) {
      setIsLoading(false);
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Por favor inicia sesión.');
      } else {
        setError(err.message || 'Error al registrar la congregación.');
      }
    }
  };


  // Quick switch to demo / existing church
  const handleSelectExistingChurch = (tenant) => {
    setLoginEmail(tenant.adminEmail);
    setLoginPassword(tenant.password);
    setError('');
  };

  const previewSettings = {
    name: churchName || 'Tu Iglesia',
    logoType,
    logoPreset,
    customLogoUrl
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-midnight-950 flex flex-col justify-center items-center p-3 sm:p-6 transition-colors duration-300 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Background celestial ambient lights */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 dark:bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-20">
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

      {/* Main Multi-Tenant Auth Card */}
      <div className="w-full max-w-lg bg-white dark:bg-midnight-900/95 border border-slate-200 dark:border-midnight-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl transition-all relative z-10 my-8">
        
        {/* Brand Header */}
        <div className="text-center pb-5 border-b border-slate-100 dark:border-midnight-800">
          <div className="flex justify-center mb-3">
            {mode === 'register' ? (
              <ChurchEmblem settings={previewSettings} size="lg" className="shadow-2xl shadow-indigo-600/30 ring-2 ring-indigo-500/40" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 ring-2 ring-white/20">
                <Music2 className="w-7 h-7" />
              </div>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Worship Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Plataforma Multi-Iglesia para Ministerios de Alabanza & Adoración
          </p>

          <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-sky-300 border border-indigo-500/25 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-sky-400" />
            <span>Espacio Conectado a Firebase Cloud</span>
          </div>
        </div>

        {/* Navigation Tabs (Login vs Sign Up) */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 my-5 bg-slate-100 dark:bg-midnight-950 rounded-2xl border border-slate-200 dark:border-midnight-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMessage('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white dark:bg-midnight-850 text-indigo-600 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setSuccessMessage('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-white dark:bg-midnight-850 text-indigo-600 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Registrar Iglesia</span>
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ----------------- TAB 1: INICIAR SESIÓN (LOGIN) ----------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Correo de la Iglesia o Administrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ej. e@gmail.com"
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Contraseña
                </label>
                <span className="text-[11px] text-slate-400">Acceso Seguro</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  Recordar mi sesión en este dispositivo
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
                  <span>Accediendo al espacio de tu iglesia...</span>
                </span>
              ) : (
                <>
                  <span>Entrar al Gestor de Alabanza</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ----------------- TAB 2: REGISTRAR NUEVA IGLESIA (SIGN UP) ----------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Church Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Nombre de la Iglesia / Congregación *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="ej. Iglesia Vida & Esperanza..."
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner font-semibold"
                />
              </div>
            </div>

            {/* Church Subtitle / Ministry */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Lema o Nombre del Ministerio
              </label>
              <input
                type="text"
                value={churchSubtitle}
                onChange={(e) => setChurchSubtitle(e.target.value)}
                placeholder="ej. Ministerio de Alabanza y Adoración"
                className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner text-xs"
              />
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Correo del Administrador / Líder *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e@gmail.com"
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                />
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la clave"
                    className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Emblem / Logo Selection (Optional) */}
            <div className="pt-2 border-t border-slate-100 dark:border-midnight-800">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Logo / Emblema de la Iglesia (Opcional)
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLogoType('preset')}
                    className={`px-2 py-0.5 rounded-lg font-bold ${
                      logoType === 'preset'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoType('custom')}
                    className={`px-2 py-0.5 rounded-lg font-bold ${
                      logoType === 'custom'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    URL Propia
                  </button>
                </div>
              </div>

              {logoType === 'preset' ? (
                <div className="grid grid-cols-6 gap-2">
                  {EMBLEM_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setLogoPreset(preset.id)}
                      className={`p-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        logoPreset === preset.id
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 scale-105'
                          : 'border-slate-200 dark:border-midnight-800 hover:border-slate-400 bg-slate-50 dark:bg-midnight-950'
                      }`}
                      title={preset.label}
                    >
                      <ChurchEmblem settings={{ logoType: 'preset', logoPreset: preset.id }} size="sm" />
                      <span className="text-[9px] font-bold mt-1 text-slate-500 truncate w-full text-center">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)}
                      placeholder="https://mi-iglesia.org/logo.png"
                      className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Starter songs choice */}
            <div className="pt-2 border-t border-slate-100 dark:border-midnight-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Catálogo inicial para empezar
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStarterOption('sample')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    starterOption === 'sample'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    ✨ Con canciones demo
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Cantos clásicos de alabanza y adoración con acordes
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStarterOption('empty')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    starterOption === 'empty'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 dark:border-midnight-800 bg-slate-50 dark:bg-midnight-950 text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    📂 Biblioteca en blanco
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Comenzar desde cero e ir agregando su repertorio
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:scale-[0.99] text-white shadow-xl shadow-emerald-600/30 transition-all border border-emerald-400/20 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando espacio seguro en la nube...</span>
                </span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Dar de Alta Iglesia y Entrar</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-midnight-800/80 text-center text-[11px] text-slate-400">
          <p>
            Cada congregación cuenta con su espacio en la nube de Firebase. Podrás iniciar sesión desde cualquier dispositivo con tu correo y contraseña.
          </p>
        </div>
      </div>
    </div>
  );
}