// Multi-Tenant Service for Worship Song Manager (Cloud Firebase Version)
import { INITIAL_SONGS, SUNDAY_HISTORY, DEFAULT_CHURCH_SETTINGS } from '../mockData';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ACTIVE_SESSION_KEY = 'worship_active_session';

const DEFAULT_DEMO_TENANT = {
  id: 'iglesia_gracia_demo',
  name: 'Iglesia Gracia & Verdad',
  subtitle: 'Ministerio de Alabanza & Adoración',
  adminEmail: 'equipo@alabanza.org',
  logoType: 'preset',
  logoPreset: 'harp',
  customLogoUrl: ''
};

class MultiTenantService {
  constructor() {
    // No dependemos de localStorage para las cuentas, sino de Firebase Cloud
  }

  getAllTenants() {
    // Devuelve al menos la demo para compatibilidad con la UI
    return [DEFAULT_DEMO_TENANT];
  }

  getTenantById(churchId) {
    return { id: churchId, name: 'Ministerio de Alabanza' };
  }

  // 1. GESTIÓN DE SESIÓN LOCAL (Para mantener la app abierta en el navegador)
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

  // 2. SINCRONIZACIÓN CON FIRESTORE (Nube)
  async getSongs(churchId) {
    try {
      if (!churchId) return INITIAL_SONGS;
      const docRef = doc(db, 'churches', churchId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().songs) {
        return docSnap.data().songs;
      }
      return INITIAL_SONGS;
    } catch (e) {
      console.error('Error reading songs from cloud:', e);
      return INITIAL_SONGS;
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