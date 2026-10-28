import React, { useState, useRef } from 'react';
import { 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Music2, 
  Building2, 
  CheckCircle2, 
  Users, 
  Eye, 
  EyeOff,
  Upload 
} from 'lucide-react';
import ChurchEmblem, { EMBLEM_PRESETS } from './ChurchEmblem';
import { multiTenantService } from '../services/multiTenantService';

export default function AuthView({ 
  theme, 
  onToggleTheme, 
  onLoginSuccess 
}) { 
  // Modo: 'login' | 'register' 
  const [mode, setMode] = useState('login');

  // Estado del Login (Solo Usuario y Contraseña)
  const [loginUsername, setLoginUsername] = useState(''); 
  const [loginPassword, setLoginPassword] = useState(''); 
  const [showLoginPassword, setShowLoginPassword] = useState(false); 
  const [rememberSession, setRememberSession] = useState(true);

  // Estado del Registro (Nombre de la iglesia, Usuario, Contraseña, Logo)
  const [churchName, setChurchName] = useState(''); 
  const [registerUsername, setRegisterUsername] = useState(''); 
  const [registerPassword, setRegisterPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showRegisterPassword, setShowRegisterPassword] = useState(false); 
  
  // Estado del Logo (Presets o Custom)
  const [logoType, setLogoType] = useState('preset'); // 'preset' | 'custom' 
  const [logoPreset, setLogoPreset] = useState('harp'); 
  const [customLogoUrl, setCustomLogoUrl] = useState(''); 
  const fileInputRef = useRef(null);

  // Estados de carga y alertas
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');

  // Manejar la subida de imagen propia en el registro
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoType('custom');
        setCustomLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar el inicio de sesión
  const handleLoginSubmit = async (e) => { 
    e.preventDefault(); 
    setError(''); 
    setSuccessMessage('');

    if (!loginUsername.trim() || !loginPassword.trim()) { 
      setError('Por favor ingresa tu usuario y contraseña.'); 
      return; 
    }

    setIsLoading(true);

    try { 
      const { church, session } = await multiTenantService.login({ 
        username: loginUsername.trim().toLowerCase(), 
        password: loginPassword, 
        rememberSession 
      }); 
      
      setIsLoading(false); 
      onLoginSuccess(session, church); 
    } catch (err) { 
      setIsLoading(false); 
      setError(err.message || 'Usuario o contraseña incorrectos.'); 
    } 
  };

  // Manejar el registro de la iglesia
  const handleRegisterSubmit = async (e) => { 
    e.preventDefault(); 
    setError(''); 
    setSuccessMessage('');

    if (!churchName.trim()) { 
      setError('Por favor ingresa el nombre de la iglesia.'); 
      return; 
    } 
    if (!registerUsername.trim()) { 
      setError('Por favor ingresa un nombre de usuario.'); 
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
      const finalLogo = logoType === 'preset' ? logoPreset : customLogoUrl;
      
      await multiTenantService.register({
        churchName: churchName.trim(),
        username: registerUsername.trim().toLowerCase(),
        password: registerPassword,
        logo: finalLogo
      });

      setIsLoading(false);
      setSuccessMessage('¡Iglesia registrada con éxito! Ya puedes iniciar sesión.');
      setTimeout(() => {
        setMode('login');
        setLoginUsername(registerUsername.trim());
      }, 1200);

    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Error al registrar la iglesia.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/60 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-3">
            <Music2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Grupo de Alabanza</h1>
          <p className="text-xs text-slate-400 mt-1">Gestión de repertorio para tu congregación</p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl mb-6 border border-slate-700/50">
          <button 
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button 
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Registrar Iglesia</span>
          </button>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ----------------- FORMULARIO DE INICIO DE SESIÓN ----------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuario
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  required 
                  value={loginUsername} 
                  onChange={(e) => setLoginUsername(e.target.value)} 
                  placeholder="ej. iglesia_central" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type={showLoginPassword ? 'text' : 'password'} 
                  required 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Iniciando sesión...' : 'Entrar al Sistema'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* ----------------- FORMULARIO DE REGISTRO ----------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nombre de la Iglesia
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  required 
                  value={churchName} 
                  onChange={(e) => setChurchName(e.target.value)} 
                  placeholder="ej. Iglesia Bautista Getsemaní" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Usuario
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  required 
                  value={registerUsername} 
                  onChange={(e) => setRegisterUsername(e.target.value)} 
                  placeholder="ej. getsemani_admin" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showRegisterPassword ? 'text' : 'password'} 
                    required 
                    value={registerPassword} 
                    onChange={(e) => setRegisterPassword(e.target.value)} 
                    placeholder="Mín. 4 car." 
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirmar
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showRegisterPassword ? 'text' : 'password'} 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Repetir" 
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner" 
                  />
                </div>
              </div>
            </div>

            {/* Logo / Emblema Celestial (Cuadrícula exacta de 6 presets + Subir archivo) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Logo / Emblema Celestial
              </label>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {EMBLEM_PRESETS.map((p) => {
                  const isSelected = logoType === 'preset' && logoPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setLogoType('preset');
                        setLogoPreset(p.id);
                      }}
                      className={`p-2 rounded-2xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-500/20 border-indigo-500 text-white ring-2 ring-indigo-500/30 shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                      title={p.description}
                    >
                      <ChurchEmblem settings={{ logoType: 'preset', logoPreset: p.id }} size="sm" />
                      <span className="text-[10px] font-bold leading-tight line-clamp-1">{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Botón para subir logo propio */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-dashed transition-colors text-xs font-bold cursor-pointer ${
                    logoType === 'custom'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {logoType === 'custom' ? '¡Logo propio cargado con éxito!' : 'Subir imagen de Logo propia (PNG, JPG, SVG)'}
                  </span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Registrando...' : 'Crear Iglesia y Registrarse'}
              {!isLoading && <Sparkles className="w-4 h-4" />}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}