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
  const [logoType, setLogoType] = useState('preset');
  const [logoPreset, setLogoPreset] = useState('harp');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [starterOption, setStarterOption] = useState('sample');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Login con Firebase Cloud
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
      // 1. Validar autenticación con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
      const user = userCredential.user;

      // 2. Buscar en Firestore la iglesia vinculada a este correo
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
        // Fallback robusto por si el registro previo usó otro formato
        const emailPrefix = cleanEmail.split('@')[0].replace(/[^a-z0-9]+/g, '_');
        churchId = `church_${emailPrefix}_${user.uid.substring(0, 6)}`;
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

  // Handle Register New Church con Firebase
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
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, registerPassword);
      const user = userCredential.user;

      // 2. Generar ID único para la Firestore Database
      const baseSlug = churchName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_');
      const uniqueId = `church_${baseSlug}_${user.uid.substring(0, 6)}`;

      // 3. Guardar el documento inicial en Firestore
      await setDoc(doc(db, 'churches', uniqueId), {
        settings: {
          name: churchName.trim(),
          subtitle: churchSubtitle.trim(),
          logoType,
          logoPreset,
          customLogoUrl: customLogoUrl.trim(),
          sharedEmail: cleanEmail,
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

  const previewSettings = {
    name: churchName || 'Tu Iglesia',
    logoType,
    logoPreset,
    customLogoUrl
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-midnight-950 flex flex-col justify-center items-center p-3 sm:p-6 transition-colors duration-300 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
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

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 my-5 bg-slate-100 dark:bg-midnight-950 rounded-2xl border border-slate-200 dark:border-midnight-800">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              mode === 'login' ? 'bg-white dark:bg-midnight-850 text-indigo-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              mode === 'register' ? 'bg-white dark:bg-midnight-850 text-indigo-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Registrar Iglesia</span>
          </button>
        </div>

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

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  placeholder="ej. tu-correo@gmail.com"
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Accediendo a la nube...</span>
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

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                  placeholder="ej. Iglesia Vida & Esperanza"
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>

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
                  placeholder="tu-correo@gmail.com"
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-inner"
                />
              </div>
            </div>

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
                    className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirmar Clave *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la clave"
                    className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registrando iglesia en la nube...</span>
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
      </div>
    </div>
  );
}