// firebaseService.js
// Capa de acceso a datos: Firestore + Firebase Auth
// Reemplaza completamente a localStorage para multi-tenancy real en la nube.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { INITIAL_SONGS, SUNDAY_HISTORY, DEFAULT_CHURCH_SETTINGS } from '../mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Estructura en Firestore:
//
//  churches/{churchId}              ← Perfil de la iglesia
//  churches/{churchId}/songs/...    ← Canciones del repertorio
//  churches/{churchId}/slots/...    ← Setlist actual (slots)
//  churches/{churchId}/history/...  ← Historial de cultos
//  churches/{churchId}/settings/main ← Configuración de la iglesia
// ─────────────────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// ── 1. AUTENTICACIÓN ──────────────────────────────────────────────────────────

/**
 * Registrar nueva iglesia: crea usuario en Firebase Auth + perfil en Firestore
 */
export async function registerChurch({
  name,
  subtitle = 'Ministerio de Alabanza',
  adminEmail,
  password,
  logoType = 'preset',
  logoPreset = 'harp',
  customLogoUrl = '',
  starterSongs = 'sample'
}) {
  const cleanEmail = adminEmail.trim().toLowerCase();
  const cleanName = name.trim();

  // 1. Crear usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const uid = userCredential.user.uid;

  // 2. Crear ID de iglesia basado en el nombre
  const baseSlug = slugify(cleanName) || 'iglesia';
  const churchId = `church_${baseSlug}_${uid.slice(0, 6)}`;

  // 3. Guardar perfil de la iglesia en Firestore
  const churchProfile = {
    id: churchId,
    uid,                    // Firebase Auth UID del administrador
    name: cleanName,
    subtitle: subtitle.trim() || 'Ministerio de Alabanza & Adoración',
    adminEmail: cleanEmail,
    logoType,
    logoPreset,
    customLogoUrl: customLogoUrl.trim(),
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'churches', churchId), churchProfile);

  // 4. Guardar referencia uid→churchId para encontrar la iglesia al hacer login
  await setDoc(doc(db, 'users', uid), {
    churchId,
    email: cleanEmail,
    createdAt: serverTimestamp()
  });

  // 5. Sembrar datos iniciales (canciones de muestra o biblioteca vacía)
  const initialSongs = starterSongs === 'sample'
    ? INITIAL_SONGS.map(s => ({ ...s, daysAgo: null, lastPlayedDate: null }))
    : [];

  await seedChurchData(churchId, {
    songs: initialSongs,
    settings: {
      ...DEFAULT_CHURCH_SETTINGS,
      name: cleanName,
      subtitle: churchProfile.subtitle,
      sharedEmail: cleanEmail,
      logoType,
      logoPreset,
      customLogoUrl: customLogoUrl.trim()
    }
  });

  const session = buildSession(uid, churchId, cleanName, cleanEmail);
  return { session, church: churchProfile };
}

/**
 * Iniciar sesión con email y contraseña
 */
export async function loginChurch(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Autenticar con Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const uid = userCredential.user.uid;

  // 2. Obtener churchId asociado a este UID
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error('No encontramos ninguna iglesia vinculada a este correo. Por favor regístrala primero.');
  }

  const { churchId } = userDoc.data();

  // 3. Obtener perfil de la iglesia
  const churchDoc = await getDoc(doc(db, 'churches', churchId));
  if (!churchDoc.exists()) {
    await signOut(auth);
    throw new Error('El perfil de tu iglesia no fue encontrado. Contacta soporte.');
  }

  const church = { id: churchDoc.id, ...churchDoc.data() };
  const session = buildSession(uid, churchId, church.name, cleanEmail);

  return { session, church };
}

/**
 * Cerrar sesión
 */
export async function logoutChurch() {
  await signOut(auth);
}

/**
 * Observador de estado de auth de Firebase (para detectar si ya hay sesión activa)
 * Llama a callback(user) cuando el estado cambia.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Obtener churchId del usuario autenticado actualmente
 */
export async function getChurchIdForCurrentUser() {
  const user = auth.currentUser;
  if (!user) return null;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return userDoc.exists() ? userDoc.data().churchId : null;
}

/**
 * Obtener perfil de iglesia por churchId
 */
export async function getChurchProfile(churchId) {
  const churchDoc = await getDoc(doc(db, 'churches', churchId));
  if (!churchDoc.exists()) return null;
  return { id: churchDoc.id, ...churchDoc.data() };
}

// ── 2. CANCIONES ──────────────────────────────────────────────────────────────

export async function getSongs(churchId) {
  try {
    const songsCol = collection(db, 'churches', churchId, 'songs');
    const snapshot = await getDocs(songsCol);
    if (snapshot.empty) return [];
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (e) {
    console.error('getSongs error:', e);
    return [];
  }
}

export async function saveSongs(churchId, songs) {
  const batch = writeBatch(db);
  const col = collection(db, 'churches', churchId, 'songs');

  // Primero borrar existentes
  const existing = await getDocs(col);
  existing.forEach(d => batch.delete(d.ref));

  // Luego escribir todos
  for (const song of songs) {
    const ref = doc(col, song.id);
    batch.set(ref, song);
  }

  await batch.commit();
}

export async function addSong(churchId, song) {
  const ref = doc(collection(db, 'churches', churchId, 'songs'), song.id);
  await setDoc(ref, song);
}

export async function updateSong(churchId, song) {
  const ref = doc(db, 'churches', churchId, 'songs', song.id);
  await setDoc(ref, song);
}

export async function deleteSong(churchId, songId) {
  await deleteDoc(doc(db, 'churches', churchId, 'songs', songId));
}

// ── 3. SLOTS (SETLIST ACTUAL) ─────────────────────────────────────────────────

export async function getSlots(churchId) {
  try {
    const slotsCol = collection(db, 'churches', churchId, 'slots');
    const snapshot = await getDocs(slotsCol);
    if (snapshot.empty) return getDefaultSlots();
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (e) {
    console.error('getSlots error:', e);
    return getDefaultSlots();
  }
}

export async function saveSlots(churchId, slots) {
  const batch = writeBatch(db);
  const col = collection(db, 'churches', churchId, 'slots');

  const existing = await getDocs(col);
  existing.forEach(d => batch.delete(d.ref));

  for (const slot of slots) {
    batch.set(doc(col, slot.id), slot);
  }

  await batch.commit();
}

// ── 4. HISTORIAL ──────────────────────────────────────────────────────────────

export async function getHistory(churchId) {
  try {
    const col = collection(db, 'churches', churchId, 'history');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (e) {
    console.error('getHistory error:', e);
    return [];
  }
}

export async function saveHistory(churchId, history) {
  const batch = writeBatch(db);
  const col = collection(db, 'churches', churchId, 'history');

  const existing = await getDocs(col);
  existing.forEach(d => batch.delete(d.ref));

  for (const entry of history) {
    batch.set(doc(col, entry.id), {
      ...entry,
      createdAt: entry.createdAt || serverTimestamp()
    });
  }

  await batch.commit();
}

// ── 5. CONFIGURACIÓN ──────────────────────────────────────────────────────────

export async function getSettings(churchId) {
  try {
    const ref = doc(db, 'churches', churchId, 'settings', 'main');
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    // Fallback: leer del perfil de la iglesia
    const church = await getChurchProfile(churchId);
    if (church) {
      return {
        ...DEFAULT_CHURCH_SETTINGS,
        name: church.name,
        subtitle: church.subtitle,
        sharedEmail: church.adminEmail,
        logoType: church.logoType || 'preset',
        logoPreset: church.logoPreset || 'harp',
        customLogoUrl: church.customLogoUrl || ''
      };
    }
    return DEFAULT_CHURCH_SETTINGS;
  } catch (e) {
    console.error('getSettings error:', e);
    return DEFAULT_CHURCH_SETTINGS;
  }
}

export async function saveSettings(churchId, settings) {
  const ref = doc(db, 'churches', churchId, 'settings', 'main');
  await setDoc(ref, settings);

  // También actualizar el perfil principal de la iglesia
  const churchRef = doc(db, 'churches', churchId);
  await updateDoc(churchRef, {
    name: settings.name,
    subtitle: settings.subtitle,
    logoType: settings.logoType,
    logoPreset: settings.logoPreset,
    customLogoUrl: settings.customLogoUrl,
    adminEmail: settings.sharedEmail
  }).catch(() => {}); // Ignorar si no existe aún
}

// ── 6. ACTUALIZAR CONTRASEÑA ──────────────────────────────────────────────────

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay sesión activa.');

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// ── HELPERS INTERNOS ──────────────────────────────────────────────────────────

function buildSession(uid, churchId, churchName, adminEmail) {
  return {
    isAuthenticated: true,
    uid,
    churchId,
    churchName,
    adminEmail,
    userName: churchName,
    loginAt: new Date().toISOString()
  };
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

async function seedChurchData(churchId, { songs, settings }) {
  const batch = writeBatch(db);

  // Sembrar canciones
  const songsCol = collection(db, 'churches', churchId, 'songs');
  for (const song of songs) {
    batch.set(doc(songsCol, song.id), song);
  }

  // Sembrar slots vacíos
  const slotsCol = collection(db, 'churches', churchId, 'slots');
  const defaultSlots = getDefaultSlots();
  for (const slot of defaultSlots) {
    // Si hay canciones de muestra, pre-asignar las primeras
    const matchingSong = slot.category === 'alabanza'
      ? songs.filter(s => s.category === 'alabanza')[defaultSlots.filter(s => s.category === 'alabanza').indexOf(slot)]
      : songs.filter(s => s.category === 'adoracion')[defaultSlots.filter(s => s.category === 'adoracion').indexOf(slot)];
    batch.set(doc(slotsCol, slot.id), { ...slot, song: matchingSong || null });
  }

  // Sembrar configuración
  const settingsRef = doc(db, 'churches', churchId, 'settings', 'main');
  batch.set(settingsRef, settings);

  await batch.commit();
}
