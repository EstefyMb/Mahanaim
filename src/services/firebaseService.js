// firebaseService.js
// Autenticación y almacenamiento directo en Cloud Firestore
// No depende de Firebase Auth (evita error auth/api-key-not-valid si Identity Toolkit no está habilitado)
// Compatible 100% con las cuentas existentes como 'mahanaim'

import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_SONGS, DEFAULT_CHURCH_SETTINGS } from '../mockData';

const SESSION_STORAGE_KEY = 'worship_church_session';

function cleanUsernameKey(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getDefaultSlots() {
  return [
    { id: 'slot-1', category: 'alabanza', song: null },
    { id: 'slot-2', category: 'alabanza', song: null },
    { id: 'slot-3', category: 'alabanza', song: null },
    { id: 'slot-4', category: 'adoracion', song: null },
    { id: 'slot-5', category: 'adoracion', song: null }
  ];
}

// ────────────────────────────────────────────────────────────────
// 1. REGISTRO EN FIRESTORE
// ────────────────────────────────────────────────────────────────

export async function registerChurch({
  churchName,
  username,
  password,
  logoType = 'preset',
  logoPreset = 'harp',
  customLogoUrl = ''
}) {
  const cleanId = cleanUsernameKey(username);
  const cleanName = churchName.trim();

  if (!cleanName || !cleanId || !password) {
    throw new Error('Todos los campos obligatorios deben ser completados.');
  }

  // Verificar si ya existe en Firestore
  const churchDocRef = doc(db, 'churches', cleanId);
  const docSnap = await getDoc(churchDocRef);

  if (docSnap.exists()) {
    throw new Error('El nombre de usuario "' + cleanId + '" ya está registrado. Por favor elige otro.');
  }

  const initialSettings = {
    ...DEFAULT_CHURCH_SETTINGS,
    name: cleanName,
    logoType,
    logoPreset,
    customLogoUrl: customLogoUrl || ''
  };

  const initialSlots = getDefaultSlots();

  const newChurchData = {
    id: cleanId,
    name: cleanName,
    username: cleanId,
    password: password,
    subtitle: 'Ministerio de Alabanza & Adoración',
    logoType,
    logoPreset,
    customLogoUrl: customLogoUrl || '',
    settings: initialSettings,
    songs: [], // Totalmente en blanco al registrar una nueva iglesia
    slots: initialSlots,
    history: [],
    createdAt: new Date().toISOString()
  };

  await setDoc(churchDocRef, newChurchData);

  const session = {
    isAuthenticated: true,
    churchId: cleanId,
    churchName: cleanName,
    username: cleanId,
    loginAt: new Date().toISOString()
  };

  saveStoredSession(session);

  return {
    session,
    church: {
      id: cleanId,
      name: cleanName,
      username: cleanId
    }
  };
}

// ────────────────────────────────────────────────────────────────
// 2. INICIO DE SESIÓN EN FIRESTORE
// ────────────────────────────────────────────────────────────────

export async function loginChurch(username, password) {
  const cleanId = cleanUsernameKey(username);

  if (!cleanId || !password) {
    throw new Error('Por favor ingresa tu usuario y contraseña.');
  }

  const churchDocRef = doc(db, 'churches', cleanId);
  const docSnap = await getDoc(churchDocRef);

  if (!docSnap.exists()) {
    throw new Error('El usuario "' + cleanId + '" no existe en la base de datos. Por favor verifica o regístrate.');
  }

  const churchData = docSnap.data();

  if (churchData.password !== password) {
    throw new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
  }

  const session = {
    isAuthenticated: true,
    churchId: cleanId,
    churchName: churchData.name,
    username: cleanId,
    loginAt: new Date().toISOString()
  };

  saveStoredSession(session);

  return {
    session,
    church: {
      id: cleanId,
      name: churchData.name,
      ...churchData
    }
  };
}

// ────────────────────────────────────────────────────────────────
// 3. PERSISTENCIA DE SESIÓN LOCAL
// ────────────────────────────────────────────────────────────────

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.isAuthenticated && parsed.churchId) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function saveStoredSession(session) {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error al guardar sesión:', e);
  }
}

export function logoutChurch() {
  saveStoredSession(null);
}

export async function changePassword(churchId, currentPassword, newPassword) {
  if (!churchId) throw new Error('No hay sesión activa.');
  const churchDocRef = doc(db, 'churches', churchId);
  const docSnap = await getDoc(churchDocRef);
  if (!docSnap.exists()) throw new Error('Iglesia no encontrada.');

  const data = docSnap.data();
  if (data.password !== currentPassword) {
    throw new Error('La contraseña actual es incorrecta.');
  }

  await updateDoc(churchDocRef, { password: newPassword });
}

export async function updateChurchProfile(churchId, updates) {
  const ref = doc(db, 'churches', churchId);
  await updateDoc(ref, updates).catch(() => {});
}
