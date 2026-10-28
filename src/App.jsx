import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SetlistBuilder from './components/SetlistBuilder';
import RepertoireExplorer from './components/RepertoireExplorer';
import FullRepertoireView from './components/FullRepertoireView';
import LyricsTransposer from './components/LyricsTransposer';
import SundayHistory from './components/SundayHistory';
import NewSongModal from './components/NewSongModal';
import EditSongModal from './components/EditSongModal';
import SettingsModal from './components/SettingsModal';
import AuthView from './components/AuthView';
import multiTenantService from './services/multiTenantService';
import { 
  INITIAL_SONGS, 
  SUNDAY_HISTORY, 
  DEFAULT_CHURCH_SETTINGS 
} from './mockData';
import { CheckCircle2, Info, PartyPopper } from 'lucide-react';

// Importaciones de Firebase Firestore
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

export default function App() {
  // 1. Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('worship_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('worship_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Multi-Tenant Session & Active Church
  const [session, setSession] = useState(() => {
    return multiTenantService.getSession();
  });

  const activeChurchId = session?.churchId || null;

  // Estados principales de la Iglesia
  const [churchSettings, setChurchSettings] = useState(DEFAULT_CHURCH_SETTINGS);
  const [songs, setSongs] = useState([]);
  const [slots, setSlots] = useState([]);
  const [history, setHistory] = useState([]);

  // ==========================================
  // SINCRONIZACIÓN EN TIEMPO REAL CON FIRESTORE
  // ==========================================
  useEffect(() => {
    if (!activeChurchId) return;

    // Referencia al documento de la iglesia en Firestore: /churches/{churchId}
    const churchDocRef = doc(db, "churches", activeChurchId);

    // Escuchar cambios en tiempo real desde la base de datos
    const unsubscribe = onSnapshot(churchDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.settings) setChurchSettings(data.settings);
        
        // CORRECCIÓN: Respetamos los arreglos de la base de datos (incluso si están vacíos [])
        setSongs(Array.isArray(data.songs) ? data.songs : []);
        setSlots(Array.isArray(data.slots) ? data.slots : []);
        setHistory(Array.isArray(data.history) ? data.history : []);
      } else {
        // Si el documento no existe aún, lo inicializamos completamente en blanco
        const initialData = {
          settings: DEFAULT_CHURCH_SETTINGS,
          songs: [],
          slots: [],
          history: []
        };
        setDoc(churchDocRef, initialData);
        setChurchSettings(DEFAULT_CHURCH_SETTINGS);
        setSongs([]);
        setSlots([]);
        setHistory([]);
      }
    });

    return () => unsubscribe();
  }, [activeChurchId]);

  // Función genérica para actualizar los datos de la iglesia en Firestore
  const updateCloudChurchData = async (newData) => {
    if (!activeChurchId) return;
    try {
      const churchDocRef = doc(db, "churches", activeChurchId);
      await setDoc(churchDocRef, newData, { merge: true });
    } catch (error) {
      console.error("Error al actualizar la base de datos:", error);
      showToast("Error al sincronizar con la nube.", "error");
    }
  };

  const handleSaveSettings = (newSettings) => {
    setChurchSettings(newSettings);
    updateCloudChurchData({ settings: newSettings });
    showToast('Configuración e identidad de la iglesia guardadas en la nube.', 'success');
  };

  const persistSongs = (updatedSongs) => {
    setSongs(updatedSongs);
    updateCloudChurchData({ songs: updatedSongs });
  };

  const persistSlots = (newSlots) => {
    setSlots(newSlots);
    updateCloudChurchData({ slots: newSlots });
  };

  const persistHistory = (newHistory) => {
    setHistory(newHistory);
    updateCloudChurchData({ history: newHistory });
  };

  // Helper for upcoming Sunday date
  const getDefaultSundayDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToSunday = (7 - dayOfWeek) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + distanceToSunday);
    return nextSunday.toISOString().split('T')[0];
  };

  const [serviceDate, setServiceDate] = useState(getDefaultSundayDate());
  const [serviceNotes, setServiceNotes] = useState('Culto Dominical con transición fluida de Alabanza a Adoración.');

  const handleLoginSuccess = (sessionData, churchData) => {
    setSession(sessionData);
    setActiveTab('dashboard');
    showToast(`¡Bienvenido al portal de ${churchData.name}!`, 'success');
  };

  const handleLogout = () => {
    multiTenantService.logout();
    setSession(null);
    showToast('Sesión de iglesia cerrada.', 'info');
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSong, setSelectedSong] = useState(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isNewSongModalOpen, setIsNewSongModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [toast, setToast] = useState(null);
  const [publishedCelebration, setPublishedCelebration] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const selectedSongIds = useMemo(() => {
    return new Set(slots.filter(s => Boolean(s.song)).map(s => s.song.id));
  }, [slots]);

  const handleAddToSetlist = (song) => {
    if (selectedSongIds.has(song.id)) {
      showToast(`"${song.title}" ya está asignada en el Setlist.`, 'info');
      return;
    }

    const emptySlot = slots.find(s => s.category === song.category && !s.song);
    if (emptySlot) {
      const nextSlots = slots.map(s => s.id === emptySlot.id ? { ...s, song } : s);
      persistSlots(nextSlots);
      showToast(`"${song.title}" asignada al bloque de ${song.category === 'alabanza' ? 'Alabanza' : 'Adoración'}.`, 'success');
    } else {
      const newSlot = {
        id: `slot-${Date.now()}`,
        category: song.category,
        song
      };
      const nextSlots = [...slots, newSlot];
      persistSlots(nextSlots);
      showToast(`"${song.title}" agregada como canción adicional de ${song.category === 'alabanza' ? 'Alabanza' : 'Adoración'}.`, 'success');
    }
  };

  const handleAssignSongToSlot = (song, slotId) => {
    if (selectedSongIds.has(song.id)) {
      showToast(`"${song.title}" ya está asignada en el Setlist.`, 'info');
      return;
    }
    const nextSlots = slots.map(s => s.id === slotId ? { ...s, song } : s);
    persistSlots(nextSlots);
    showToast(`"${song.title}" asignada correctamente.`, 'success');
  };

  const handleClearSlotSong = (slotId) => {
    const nextSlots = slots.map(s => s.id === slotId ? { ...s, song: null } : s);
    persistSlots(nextSlots);
  };

  const handleAddSlot = (category) => {
    const newSlot = {
      id: `slot-${Date.now()}`,
      category,
      song: null
    };
    const lastIndex = slots.map(s => s.category).lastIndexOf(category);
    const nextSlots = [...slots];
    if (lastIndex !== -1) {
      nextSlots.splice(lastIndex + 1, 0, newSlot);
    } else {
      nextSlots.push(newSlot);
    }
    persistSlots(nextSlots);
    showToast(`Nuevo espacio de ${category === 'alabanza' ? 'Alabanza' : 'Adoración'} añadido.`, 'success');
  };

  const handleRemoveSlot = (slotId) => {
    const nextSlots = slots.filter(s => s.id !== slotId);
    persistSlots(nextSlots);
    showToast('Espacio eliminado del setlist.', 'info');
  };

  const handleClearAllSlots = () => {
    const emptiedSlots = slots.map(s => ({ ...s, song: null }));
    persistSlots(emptiedSlots);
    showToast('Todos los espacios de la lista han sido vaciados.', 'info');
  };

  const handleReorderSlots = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    const sourceIndex = slots.findIndex(s => s.id === sourceId);
    const targetIndex = slots.findIndex(s => s.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const nextSlots = [...slots];
    const sourceSong = nextSlots[sourceIndex].song;
    const targetSong = nextSlots[targetIndex].song;

    nextSlots[sourceIndex] = { ...nextSlots[sourceIndex], song: targetSong };
    nextSlots[targetIndex] = { ...nextSlots[targetIndex], song: sourceSong };

    persistSlots(nextSlots);
    showToast('Orden de canciones actualizado.', 'info');
  };

  const handleMoveSlot = (slotId, direction) => {
    const index = slots.findIndex(s => s.id === slotId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slots.length) return;

    const nextSlots = [...slots];
    const currentSong = nextSlots[index].song;
    const targetSong = nextSlots[targetIndex].song;

    nextSlots[index] = { ...nextSlots[index], song: targetSong };
    nextSlots[targetIndex] = { ...nextSlots[targetIndex], song: currentSong };

    persistSlots(nextSlots);
  };

  const handleAutoSuggest = () => {
    if (songs.length === 0) {
      showToast('No hay canciones registradas en el repertorio para sugerir.', 'info');
      return;
    }

    const sortByOldest = (list) => {
      return [...list].sort((a, b) => {
        const aDays = a.daysAgo === null || a.daysAgo === undefined ? 999 : a.daysAgo;
        const bDays = b.daysAgo === null || b.daysAgo === undefined ? 999 : b.daysAgo;
        return bDays - aDays;
      });
    };

    const eligibleAlabanzas = sortByOldest(songs.filter(s => s.category === 'alabanza'));
    const eligibleAdoraciones = sortByOldest(songs.filter(s => s.category === 'adoracion'));

    let alabanzaIdx = 0;
    let adoracionIdx = 0;

    const nextSlots = slots.map(slot => {
      if (slot.category === 'alabanza') {
        const song = eligibleAlabanzas[alabanzaIdx++] || null;
        return { ...slot, song };
      } else {
        const song = eligibleAdoraciones[adoracionIdx++] || null;
        return { ...slot, song };
      }
    });

    persistSlots(nextSlots);
    showToast('✨ ¡Setlist generado con la Regla de Oro en la nube!', 'success');
  };

  const handlePublishSetlist = () => {
    const filled = slots.filter(s => Boolean(s.song));
    if (filled.length < slots.length) {
      showToast(`Por favor asigna todos los cantos (${filled.length}/${slots.length}) antes de publicar.`, 'error');
      return;
    }

    const formattedDate = new Date(serviceDate + 'T12:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const newHistoryEntry = {
      id: `history-${Date.now()}`,
      date: formattedDate,
      relativeDays: 'Publicado',
      notes: serviceNotes,
      setlist: slots.map((s, idx) => ({
        order: idx + 1,
        songId: s.song.id,
        title: s.song.title,
        key: s.song.originalKey,
        category: s.category
      }))
    };

    const nextHistory = [newHistoryEntry, ...history];
    persistHistory(nextHistory);

    const setlistSongIds = new Set(slots.map(s => s.song.id));
    const nextSongs = songs.map(song => {
      if (setlistSongIds.has(song.id)) {
        return {
          ...song,
          daysAgo: 0,
          lastPlayedDate: formattedDate
        };
      }
      return song;
    });

    persistSongs(nextSongs);

    const updatedActiveSlots = slots.map(s => ({
      ...s,
      song: s.song ? { ...s.song, daysAgo: 0, lastPlayedDate: formattedDate } : null
    }));
    persistSlots(updatedActiveSlots);

    setPublishedCelebration({
      date: formattedDate,
      songs: slots.map(s => s.song)
    });
    showToast('💾 ¡Culto publicado y guardado en la nube!', 'success');
  };

  const handleViewLyrics = (song) => {
    setSelectedSong(song);
    setActiveTab('viewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSongLyricsById = (songId) => {
    const found = songs.find(s => s.id === songId);
    if (found) {
      handleViewLyrics(found);
    }
  };

  const handleLoadHistoricalSetlist = (historicalRecord) => {
    const loadedSlots = historicalRecord.setlist.map((item, idx) => {
      const foundSong = songs.find(s => s.id === item.songId);
      return {
        id: `slot-${idx + 1}`,
        category: item.category || 'alabanza',
        song: foundSong || null
      };
    });

    persistSlots(loadedSlots);
    setActiveTab('dashboard');
    showToast(`Plantilla cargada en el Setlist.`, 'success');
  };

  const handleSaveNewSong = (newSong) => {
    const nextSongs = [newSong, ...songs];
    persistSongs(nextSongs);
    showToast(`Canto "${newSong.title}" agregado al repertorio en la nube.`, 'success');
  };

  const handleUpdateSong = (updatedSong) => {
    const nextSongs = songs.map(s => s.id === updatedSong.id ? updatedSong : s);
    persistSongs(nextSongs);

    const nextSlots = slots.map(s => s.song?.id === updatedSong.id ? { ...s, song: updatedSong } : s);
    persistSlots(nextSlots);

    if (selectedSong?.id === updatedSong.id) {
      setSelectedSong(updatedSong);
    }

    showToast(`Canto "${updatedSong.title}" actualizado.`, 'success');
  };

  const handleDeleteSong = (songId) => {
    const target = songs.find(s => s.id === songId);
    const nextSongs = songs.filter(s => s.id !== songId);
    persistSongs(nextSongs);

    const nextSlots = slots.map(s => s.song?.id === songId ? { ...s, song: null } : s);
    persistSlots(nextSlots);

    showToast(`"${target?.title || 'Canción'}" eliminada.`, 'info');
  };

  const handleResetRepertoire = () => {
    persistSongs(INITIAL_SONGS);
    persistHistory(SUNDAY_HISTORY);
    persistSlots([
      { id: 'slot-1', category: 'alabanza', song: INITIAL_SONGS[0] },
      { id: 'slot-2', category: 'alabanza', song: INITIAL_SONGS[1] },
      { id: 'slot-3', category: 'alabanza', song: INITIAL_SONGS[2] },
      { id: 'slot-4', category: 'adoracion', song: INITIAL_SONGS[7] },
      { id: 'slot-5', category: 'adoracion', song: INITIAL_SONGS[8] },
    ]);
    showToast('Repertorio restablecido a los datos de demostración.', 'info');
  };

  const filledCount = slots.filter(s => Boolean(s.song)).length;
  const currentSetlistSongs = slots.map(s => s.song).filter(Boolean);

  if (!session?.isAuthenticated) {
    return (
      <AuthView
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-midnight-950 text-slate-800 dark:text-slate-100 flex selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-midnight-900 border border-indigo-500/50 shadow-2xl shadow-black/20 text-sm animate-in slide-in-from-bottom duration-300">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
          )}
          <span className="font-bold text-slate-800 dark:text-slate-200">{toast.message}</span>
        </div>
      )}

      {/* Published Celebration Banner Modal */}
      {publishedCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-midnight-900 border border-slate-200 dark:border-midnight-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4">
              <PartyPopper className="w-7 h-7" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              ¡Culto Publicado en la Nube!
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              El servicio para el <strong>{publishedCelebration.date}</strong> ha sido guardado en Firestore.
            </p>

            <button
              onClick={() => setPublishedCelebration(null)}
              className="w-full mt-5 py-3 rounded-2xl font-black text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        churchSettings={churchSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        session={session}
        onLogout={handleLogout}
        filledCount={filledCount}
        totalSlotsCount={slots.length}
        totalSongsCount={songs.length}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden min-h-screen">
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsSidebarOpenMobile(true)}
          onOpenNewSongModal={() => setIsNewSongModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          churchSettings={churchSettings}
          filledCount={filledCount}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 order-1 lg:order-1">
                <SetlistBuilder
                  slots={slots}
                  allSongs={songs}
                  serviceDate={serviceDate}
                  setServiceDate={setServiceDate}
                  serviceNotes={serviceNotes}
                  setServiceNotes={setServiceNotes}
                  onAssignSongToSlot={handleAssignSongToSlot}
                  onClearSlotSong={handleClearSlotSong}
                  onAddSlot={handleAddSlot}
                  onRemoveSlot={handleRemoveSlot}
                  onAutoSuggest={handleAutoSuggest}
                  onPublishSetlist={handlePublishSetlist}
                  onViewLyrics={handleViewLyrics}
                  onClearAllSlots={handleClearAllSlots}
                  onReorderSlots={handleReorderSlots}
                  onMoveSlot={handleMoveSlot}
                />
              </div>

              <div className="lg:col-span-7 order-2 lg:order-2">
                <RepertoireExplorer
                  songs={songs}
                  selectedSongIds={selectedSongIds}
                  onAddToSetlist={handleAddToSetlist}
                  onViewLyrics={handleViewLyrics}
                  onEditSong={(song) => setEditingSong(song)}
                />
              </div>
            </div>
          )}

          {activeTab === 'repertoire' && (
            <FullRepertoireView
              songs={songs}
              selectedSongIds={selectedSongIds}
              onAddToSetlist={handleAddToSetlist}
              onViewLyrics={handleViewLyrics}
              onEditSong={(song) => setEditingSong(song)}
              onOpenNewSongModal={() => setIsNewSongModalOpen(true)}
              onDeleteSong={handleDeleteSong}
            />
          )}

          {activeTab === 'viewer' && (
            <div className="max-w-4xl mx-auto">
              <LyricsTransposer
                song={selectedSong || songs[0]}
                allSongs={songs}
                currentSetlist={currentSetlistSongs}
                onSelectSong={setSelectedSong}
                onBack={() => setActiveTab('repertoire')}
                onEditSong={(song) => setEditingSong(song)}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <SundayHistory
                history={history}
                onLoadHistoricalSetlist={handleLoadHistoricalSetlist}
                onViewSongLyrics={handleViewSongLyricsById}
              />
            </div>
          )}
        </main>

        <footer className="mt-auto border-t border-slate-200 dark:border-midnight-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
          {churchSettings.name} · Worship PWA · Conectado a Firebase Firestore
        </footer>
      </div>

      <NewSongModal
        isOpen={isNewSongModalOpen}
        onClose={() => setIsNewSongModalOpen(false)}
        onSaveSong={handleSaveNewSong}
      />

      <EditSongModal
        isOpen={Boolean(editingSong)}
        song={editingSong}
        onClose={() => setEditingSong(null)}
        onUpdateSong={handleUpdateSong}
        onDeleteSong={handleDeleteSong}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={churchSettings}
        onSaveSettings={handleSaveSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetRepertoire={handleResetRepertoire}
        onLogout={handleLogout}
        songsCount={songs.length}
        tenantId={session?.churchId}
      />
    </div>
  );
}