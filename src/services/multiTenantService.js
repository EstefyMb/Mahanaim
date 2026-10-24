// Multi-Tenant Service for Worship Song Manager
// Manages isolated church accounts, credentials, and data partitioning (multi-tenancy)

import { INITIAL_SONGS, SUNDAY_HISTORY, DEFAULT_CHURCH_SETTINGS } from '../mockData';

const TENANTS_STORAGE_KEY = 'worship_tenants_registry';
const ACTIVE_SESSION_KEY = 'worship_active_session';

// Default Demo Church (Seed tenant so app is functional out of the box)
const DEFAULT_DEMO_TENANT = {
  id: 'iglesia_gracia_demo',
  name: 'Iglesia Gracia & Verdad',
  subtitle: 'Ministerio de Alabanza & Adoración',
  adminEmail: 'equipo@alabanza.org',
  password: 'worship2026',
  logoType: 'preset',
  logoPreset: 'harp',
  customLogoUrl: '',
  createdAt: '2026-01-01T00:00:00.000Z'
};

const DEFAULT_INITIAL_SLOTS = [
  { id: 'slot-1', category: 'alabanza', song: INITIAL_SONGS[0] }, // Digno de Alabar
  { id: 'slot-2', category: 'alabanza', song: INITIAL_SONGS[1] }, // En Tu Luz
  { id: 'slot-3', category: 'alabanza', song: INITIAL_SONGS[2] }, // El León de Judá
  { id: 'slot-4', category: 'adoracion', song: INITIAL_SONGS[7] }, // La Bondad de Dios
  { id: 'slot-5', category: 'adoracion', song: INITIAL_SONGS[8] }, // Tumbas a Jardines
];

// Helper to normalize strings for IDs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * MultiTenantService
 * Handles all church registrations, authentication and tenant data isolation.
 */
class MultiTenantService {
  constructor() {
    this.init();
  }

  init() {
    // Ensure tenants registry exists with at least the demo church
    const existing = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (!existing) {
      const initialTenants = [DEFAULT_DEMO_TENANT];
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(initialTenants));
      
      // Seed demo church's isolated data
      this.seedTenantData(DEFAULT_DEMO_TENANT.id, {
        songs: INITIAL_SONGS,
        slots: DEFAULT_INITIAL_SLOTS,
        history: SUNDAY_HISTORY,
        settings: {
          ...DEFAULT_CHURCH_SETTINGS,
          name: DEFAULT_DEMO_TENANT.name,
          subtitle: DEFAULT_DEMO_TENANT.subtitle,
          sharedEmail: DEFAULT_DEMO_TENANT.adminEmail,
          logoPreset: DEFAULT_DEMO_TENANT.logoPreset
        }
      });
    }
  }

  // 1. TENANT MANAGEMENT
  getAllTenants() {
    try {
      const data = localStorage.getItem(TENANTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [DEFAULT_DEMO_TENANT];
    } catch (e) {
      console.error('Error reading tenants:', e);
      return [DEFAULT_DEMO_TENANT];
    }
  }

  getTenantById(churchId) {
    const tenants = this.getAllTenants();
    return tenants.find(t => t.id === churchId) || null;
  }

  getTenantByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const tenants = this.getAllTenants();
    return tenants.find(t => t.adminEmail.toLowerCase() === cleanEmail) || null;
  }

  /**
   * Register a new Church (Tenant)
   * Creates an isolated workspace and database document for this church.
   */
  registerChurch({
    name,
    subtitle = 'Ministerio de Alabanza',
    adminEmail,
    password,
    logoType = 'preset',
    logoPreset = 'harp',
    customLogoUrl = '',
    starterSongs = 'sample' // 'sample' = starter worship repertoire, 'empty' = clean library
  }) {
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      throw new Error('Todos los campos obligatorios deben ser completados.');
    }

    const existing = this.getTenantByEmail(cleanEmail);
    if (existing) {
      throw new Error(`Ya existe una iglesia registrada con el correo ${cleanEmail}. Por favor inicia sesión.`);
    }

    const baseSlug = slugify(cleanName) || 'iglesia';
    const uniqueId = `church_${baseSlug}_${Date.now().toString(36)}`;

    const newTenant = {
      id: uniqueId,
      name: cleanName,
      subtitle: subtitle.trim() || 'Ministerio de Alabanza & Adoración',
      adminEmail: cleanEmail,
      password: password, // In production, hashed via backend/Supabase/Firebase
      logoType,
      logoPreset,
      customLogoUrl: customLogoUrl.trim(),
      createdAt: new Date().toISOString()
    };

    const tenants = this.getAllTenants();
    tenants.push(newTenant);
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));

    // Initialize Isolated Data for this Church
    const initialChurchSongs = starterSongs === 'sample' 
      ? INITIAL_SONGS.map(s => ({
          ...s,
          // Reset lastPlayedDate to fresh state for new church
          lastPlayedDate: null,
          daysAgo: null
        }))
      : [];

    const initialChurchSlots = [
      { id: 'slot-1', category: 'alabanza', song: initialChurchSongs[0] || null },
      { id: 'slot-2', category: 'alabanza', song: initialChurchSongs[1] || null },
      { id: 'slot-3', category: 'alabanza', song: initialChurchSongs[2] || null },
      { id: 'slot-4', category: 'adoracion', song: initialChurchSongs[3] || null },
      { id: 'slot-5', category: 'adoracion', song: initialChurchSongs[4] || null },
    ];

    this.seedTenantData(uniqueId, {
      songs: initialChurchSongs,
      slots: initialChurchSlots,
      history: [],
      settings: {
        name: newTenant.name,
        subtitle: newTenant.subtitle,
        logoType: newTenant.logoType,
        logoPreset: newTenant.logoPreset,
        customLogoUrl: newTenant.customLogoUrl,
        sharedEmail: newTenant.adminEmail,
        sessionActive: true,
        sessionUser: 'Administrador'
      }
    });

    // Auto-login session
    const session = {
      isAuthenticated: true,
      churchId: newTenant.id,
      churchName: newTenant.name,
      adminEmail: newTenant.adminEmail,
      userName: newTenant.name,
      token: `token_${uniqueId}_${Date.now()}`,
      loginAt: new Date().toISOString()
    };

    this.setSession(session);
    return { tenant: newTenant, session };
  }

  // 2. AUTHENTICATION (LOGIN / LOGOUT)
  login({ email, password, rememberSession = true }) {
    const cleanEmail = email.trim().toLowerCase();
    const tenants = this.getAllTenants();
    
    // First find if the church exists in this browser's registry
    const church = tenants.find(t => t.adminEmail.toLowerCase() === cleanEmail);

    if (!church) {
      throw new Error(`No encontramos ninguna iglesia registrada con el correo "${email}" en este navegador. Si te diste de alta en localhost o es tu primera vez entrando desde Vercel o tu móvil, por favor haz clic en la pestaña "Registrar Iglesia" para darla de alta.`);
    }

    if (church.password !== password) {
      throw new Error('La contraseña ingresada es incorrecta. Por favor verifícala.');
    }

    const session = {
      isAuthenticated: true,
      churchId: church.id,
      churchName: church.name,
      adminEmail: church.adminEmail,
      userName: church.name,
      token: `token_${church.id}_${Date.now()}`,
      loginAt: new Date().toISOString()
    };

    if (rememberSession) {
      this.setSession(session);
    }

    return { church, session };
  }

  logout() {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }

  // Export all local database data to JSON (allows migrating from localhost to Vercel)
  exportFullBackup() {
    try {
      const backup = {
        tenants: this.getAllTenants(),
        tenantData: {},
        exportedAt: new Date().toISOString()
      };

      for (const tenant of backup.tenants) {
        backup.tenantData[tenant.id] = {
          songs: this.getSongs(tenant.id),
          slots: this.getSlots(tenant.id),
          history: this.getHistory(tenant.id),
          settings: this.getSettings(tenant.id)
        };
      }

      return JSON.stringify(backup, null, 2);
    } catch (e) {
      console.error('Error exporting backup:', e);
      return null;
    }
  }

  // Import full database backup from JSON
  importFullBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.tenants)) {
        throw new Error('El archivo o texto de respaldo no tiene un formato válido.');
      }

      // Merge or replace tenants
      const existing = this.getAllTenants();
      const existingMap = new Map(existing.map(t => [t.id, t]));

      for (const tenant of data.tenants) {
        existingMap.set(tenant.id, tenant);
        if (data.tenantData && data.tenantData[tenant.id]) {
          this.saveTenantData(tenant.id, data.tenantData[tenant.id]);
        }
      }

      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(Array.from(existingMap.values())));
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      throw e;
    }
  }

  // 3. SESSION PERSISTENCE
  getSession() {
    try {
      const data = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data);
      // Validate that tenant still exists
      if (session?.churchId && this.getTenantById(session.churchId)) {
        return session;
      }
      return null;
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

  // 4. DATA ISOLATION HELPERS (STRICT MULTI-TENANCY NAMESPACING)
  getTenantKey(churchId, entityName) {
    if (!churchId) throw new Error('ChurchId is strictly required for multi-tenant data access');
    return `worship_tenant_${churchId}_${entityName}`;
  }

  seedTenantData(churchId, { songs, slots, history, settings }) {
    localStorage.setItem(this.getTenantKey(churchId, 'songs'), JSON.stringify(songs || []));
    localStorage.setItem(this.getTenantKey(churchId, 'slots'), JSON.stringify(slots || []));
    localStorage.setItem(this.getTenantKey(churchId, 'history'), JSON.stringify(history || []));
    localStorage.setItem(this.getTenantKey(churchId, 'settings'), JSON.stringify(settings || {}));
  }

  // Songs
  getSongs(churchId) {
    try {
      const key = this.getTenantKey(churchId, 'songs');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveSongs(churchId, songs) {
    const key = this.getTenantKey(churchId, 'songs');
    localStorage.setItem(key, JSON.stringify(songs));
  }

  // Setlist Slots
  getSlots(churchId) {
    try {
      const key = this.getTenantKey(churchId, 'slots');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : DEFAULT_INITIAL_SLOTS;
    } catch (e) {
      return DEFAULT_INITIAL_SLOTS;
    }
  }

  saveSlots(churchId, slots) {
    const key = this.getTenantKey(churchId, 'slots');
    localStorage.setItem(key, JSON.stringify(slots));
  }

  // History
  getHistory(churchId) {
    try {
      const key = this.getTenantKey(churchId, 'history');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveHistory(churchId, history) {
    const key = this.getTenantKey(churchId, 'history');
    localStorage.setItem(key, JSON.stringify(history));
  }

  // Settings
  getSettings(churchId) {
    try {
      const key = this.getTenantKey(churchId, 'settings');
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      const tenant = this.getTenantById(churchId);
      return {
        ...DEFAULT_CHURCH_SETTINGS,
        name: tenant?.name || 'Mi Iglesia',
        subtitle: tenant?.subtitle || 'Ministerio de Alabanza',
        sharedEmail: tenant?.adminEmail || '',
        logoPreset: tenant?.logoPreset || 'harp',
        customLogoUrl: tenant?.customLogoUrl || ''
      };
    } catch (e) {
      return DEFAULT_CHURCH_SETTINGS;
    }
  }

  saveSettings(churchId, settings) {
    const key = this.getTenantKey(churchId, 'settings');
    localStorage.setItem(key, JSON.stringify(settings));

    // Also update tenant registry profile
    const tenants = this.getAllTenants();
    const updatedTenants = tenants.map(t => {
      if (t.id === churchId) {
        return {
          ...t,
          name: settings.name || t.name,
          subtitle: settings.subtitle || t.subtitle,
          logoType: settings.logoType || t.logoType,
          logoPreset: settings.logoPreset || t.logoPreset,
          customLogoUrl: settings.customLogoUrl || t.customLogoUrl,
          adminEmail: settings.sharedEmail || t.adminEmail
        };
      }
      return t;
    });
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(updatedTenants));
  }
}

export const multiTenantService = new MultiTenantService();
export default multiTenantService;
