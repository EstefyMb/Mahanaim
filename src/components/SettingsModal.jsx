import React, { useState, useRef } from 'react';
import { 
  X, 
  Church, 
  Upload, 
  Check, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Download,
  KeyRound,
  Users
} from 'lucide-react';
import ChurchEmblem, { EMBLEM_PRESETS } from './ChurchEmblem';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  theme,
  onToggleTheme,
  onResetRepertoire,
  onLogout,
  songsCount = 0
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('identity');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          logoType: 'custom',
          customLogoUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-midnight-800 flex items-center justify-between bg-slate-50 dark:bg-midnight-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Church className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Configuración del Ministerio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Identidad de la iglesia, tema visual y sesión activa.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-midnight-800 px-6 bg-slate-50/50 dark:bg-midnight-950/30">
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'identity'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Identidad & Logo
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'appearance'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Apariencia ("Azul Medianoche")
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'session'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sesión & Datos
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'identity' && (
            <div className="space-y-5">
              {/* Preview Banner */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-midnight-950/80 border border-slate-200 dark:border-midnight-800 flex items-center gap-4">
                <ChurchEmblem settings={formData} size="lg" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Vista previa en Cabecera
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {formData.name || 'Nombre de la Iglesia'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formData.subtitle || 'Ministerio de Alabanza'}
                  </p>
                </div>
              </div>

              {/* Church Name & Subtitle inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nombre de la Iglesia
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Iglesia Gracia Soberana"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Subtítulo / Ministerio
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ministerio de Alabanza & Adoración"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Logo Selection: Presets vs Custom */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Logo / Emblema Celestial
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {EMBLEM_PRESETS.map((p) => {
                    const isSelected = formData.logoType === 'preset' && formData.logoPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoType: 'preset', logoPreset: p.id })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 dark:bg-midnight-950 border-slate-200 dark:border-midnight-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                        title={p.description}
                      >
                        <ChurchEmblem settings={{ logoType: 'preset', logoPreset: p.id }} size="sm" />
                        <span className="text-[10px] font-bold leading-tight line-clamp-1">{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom File Upload */}
                <div className="pt-2">
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
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-midnight-800 hover:border-indigo-500 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir imagen de Logo propia (PNG, JPG, SVG)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Paleta de Diseño: Azul Medianoche & Luz Celestial
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Modo Oscuro */}
                  <div
                    onClick={() => theme !== 'dark' && onToggleTheme()}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-indigo-500 bg-[#070b14] ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-900/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Moon className="w-4 h-4 text-sky-400" />
                        <span>Azul Medianoche</span>
                      </div>
                      {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Fondo oscuro profundo con destellos celestiales dorados y cian. Optimizado para lectura en escenarios con luces bajas.
                    </p>
                  </div>

                  {/* Modo Claro */}
                  <div
                    onClick={() => theme !== 'light' && onToggleTheme()}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-md'
                        : 'border-slate-700 bg-slate-100 dark:bg-slate-800/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Luz Celestial</span>
                      </div>
                      {theme === 'light' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Limpio, luminoso y minimalista con tarjetas blancas y acentos en azul índigo y oro cálido para oficinas y ensayos diurnos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'session' && (
            <div className="space-y-4">
              {/* Active Session Info */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      Sesión Compartida Activa
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                      Permanente
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Tu equipo de músicos no requiere re-autenticarse en cada ensayo. Todos los cambios se sincronizan en el almacenamiento local seguro.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Correo Compartido del Equipo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={formData.sharedEmail}
                    onChange={(e) => setFormData({ ...formData, sharedEmail: e.target.value })}
                    className="flex-1 bg-slate-50 dark:bg-midnight-950 border border-slate-300 dark:border-midnight-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Repertoire Stats & Reset */}
              <div className="pt-3 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Repertorio Actual
                  </span>
                  <p className="text-[11px] text-slate-500">{songsCount} cantos registrados</p>
                </div>
                <button
                  type="button"
                  onClick={onResetRepertoire}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar datos demo</span>
                </button>
              </div>

              {/* Logout Option */}
              {onLogout && (
                <div className="pt-3 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Salir de la Sesión
                    </span>
                    <p className="text-[11px] text-slate-500">Cierra la sesión activa en este dispositivo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-300 dark:border-rose-900 transition-colors"
                  >
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-midnight-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-midnight-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
