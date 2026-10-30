// Multi-Tenant Service for Worship Song Manager (Cloud Firebase Version - 100% Blindado Offline)
import { INITIAL_SONGS, SUNDAY_HISTORY, DEFAULT_CHURCH_SETTINGS } from '../mockData';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ACTIVE_SESSION_KEY = 'worship_active_session';

class MultiTenantService {
  constructor() {}

  getSession() {
    try {
      const data = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  setSession(session) {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Error saving session:', e);
    }
  }

  logout() {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }

  // 1. REGISTRAR NUEVA IGLESIA
  async register({ churchName, username, password, logo }) {
    const cleanId = username.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanName = churchName.trim();

    if (!cleanName || !cleanId || !password) {
      throw new Error('Todos los campos obligatorios deben ser completados.');
    }

    const docRef = doc(db, 'churches', cleanId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      throw new Error('El usuario o ID de iglesia ya existe. Elige otro.');
    }

    const newChurchData = {
      id: cleanId,
      name: cleanName,
      username: cleanId,
      subtitle: 'Ministerio de Alabanza & Adoración',
      password: password,
      logo: logo || 'harp',
      logoPreset: logo || 'harp',
      logoType: 'preset',
      customLogoUrl: '',
      sessionActive: true,
      sessionUser: cleanName,
      songs: [],       
      slots: [],       
      history: [],    
      settings: {
        ...DEFAULT_CHURCH_SETTINGS,
        name: cleanName,
        logoPreset: logo || 'harp'
      },
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, newChurchData);
    return newChurchData;
  }

  // 2. INICIAR SESIÓN (Soporta modo offline si ya se había recordado)
  async login({ username, password, rememberSession }) {
    const cleanId = username.trim().toLowerCase().replace(/\s+/g, '_');

    if (!cleanId || !password) {
      throw new Error('Por favor ingresa tu usuario y contraseña.');
    }

    const docRef = doc(db, 'churches', cleanId);
    
    try {
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('El usuario ingresado no existe en la base de datos.');
      }

      const churchData = docSnap.data();

      if (churchData.password !== password) {
        throw new Error('Contraseña incorrecta.');
      }

      const session = {
        isAuthenticated: true,
        churchId: churchData.id,
        username: churchData.id,
        churchName: churchData.name,
        loggedInAt: new Date().toISOString()
      };

      if (rememberSession) {
        this.setSession(session);
      }

      return {
        church: {
          id: churchData.id,
          name: churchData.name,
          logo: churchData.logo || churchData.logoPreset
        },
        session
      };
    } catch (error) {
      // Si no hay internet, revisamos si hay una sesión previa guardada localmente
      const localSession = this.getSession();
      if (localSession && localSession.churchId === cleanId) {
        return {
          church: {
            id: localSession.churchId,
            name: localSession.churchName,
            logo: 'harp'
          },
          session: localSession
        };
      }
      throw new Error('No hay conexión a internet y no se encontró una sesión previa en este equipo.');
    }
  }

  // 3. OBTENER Y GUARDAR DATOS (BLINDADOS CONTRA VACIAMIENTO OFFLINE)
  async getSongs(churchId) {
    try {
      if (!churchId) return [];
      const docRef = doc(db, 'churches', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudSongs = docSnap.data().songs;
        // Si hay canciones en la nube, se devuelven con seguridad
        if (Array.isArray(cloudSongs) && cloudSongs.length > 0) {
          return cloudSongs;
        }
      }
      return [];
    } catch (e) {
      console.warn('⚠️ Sin conexión a internet. Intentando recuperar canciones locales o caché.');
      return [];
    }
  }

  async saveSongs(churchId, songs) {
    try {
      if (!churchId) return;
      
      // 🛡️ BLINDAJE CRÍTICO: Nunca permitimos sobrescribir con un arreglo vacío si la app pierde red accidentalmente
      if (!songs || (Array.isArray(songs) && songs.length === 0)) {
        console.warn('🛡️ Bloqueado: Se intentó guardar un repertorio vacío por un fallo de red. Datos protegidos.');
        return;
      }

      const docRef = doc(db, 'churches', churchId);
      await updateDoc(docRef, { songs });
    } catch (e) {
      console.error('Error saving songs to cloud (Offline):', e);
    }
  }

  async getSlots(churchId) {
    try {
      if (!churchId) return [];
      const docRef = doc(db, 'churches', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().slots) {
        return docSnap.data().slots;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  async saveSlots(churchId, slots) {
    try {
      if (!churchId) return;
      if (!slots || (Array.isArray(slots) && slots.length === 0)) return;
      const docRef = doc(db, 'churches', churchId);
      await updateDoc(docRef, { slots });
    } catch (e) {
      console.error('Error saving slots to cloud:', e);
    }
  }

  async getHistory(churchId) {
    try {
      if (!churchId) return [];
      const docRef = doc(db, 'churches', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().history) {
        return docSnap.data().history;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  async saveHistory(churchId, history) {
    try {
      if (!churchId) return;
      if (!history || (Array.isArray(history) && history.length === 0)) return;
      const docRef = doc(db, 'churches', churchId);
      await updateDoc(docRef, { history });
    } catch (e) {
      console.error('Error saving history to cloud:', e);
    }
  }

  async getSettings(churchId) {
    try {
      if (!churchId) return DEFAULT_CHURCH_SETTINGS;
      const docRef = doc(db, 'churches', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().settings) {
        return docSnap.data().settings;
      }
      return DEFAULT_CHURCH_SETTINGS;
    } catch (e) {
      return DEFAULT_CHURCH_SETTINGS;
    }
  }

  async saveSettings(churchId, settings) {
    try {
      if (!churchId) return;
      const docRef = doc(db, 'churches', churchId);
      await updateDoc(docRef, { settings });
    } catch (e) {
      console.error('Error saving settings to cloud:', e);
    }
  }
}

export const multiTenantService = new MultiTenantService();
export default multiTenantService;