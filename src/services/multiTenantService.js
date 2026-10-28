// Multi-Tenant Service for Worship Song Manager (Cloud Firebase Version - Cero Correos & Repertorio en Blanco)
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

  // 1. REGISTRAR NUEVA IGLESIA (Sin correos y con repertorio en blanco)
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

    // Estructura limpia SIN correos y en blanco para que ellos metan sus canciones
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
      songs: [],      // <-- Repertorio inicial vacío
      slots: [],      // <-- Espacios de setlist limpios
      history: [],    // <-- Historial vacío
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

  // 2. INICIAR SESIÓN CON USUARIO Y CONTRASEÑA
  async login({ username, password, rememberSession }) {
    const cleanId = username.trim().toLowerCase().replace(/\s+/g, '_');

    if (!cleanId || !password) {
      throw new Error('Por favor ingresa tu usuario y contraseña.');
    }

    const docRef = doc(db, 'churches', cleanId);
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
  }

  // 3. OBTENER Y GUARDAR DATOS
  async getSongs(churchId) {
    try {
      if (!churchId) return [];
      const docRef = doc(db, 'churches', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().songs) {
        return docSnap.data().songs;
      }
      return [];
    } catch (e) {
      console.error('Error reading songs from cloud:', e);
      return [];
    }
  }

  async saveSongs(churchId, songs) {
    try {
      if (!churchId) return;
      const docRef = doc(db, 'churches', churchId);
      await updateDoc(docRef, { songs });
    } catch (e) {
      console.error('Error saving songs to cloud:', e);
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