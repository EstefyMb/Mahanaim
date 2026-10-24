# 🏛️ Multi-Tenant Architecture & Database Security Rules
### Worship Song Manager - Aislamiento Estricto por Iglesia

Este documento define la arquitectura y las reglas de seguridad necesarias para garantizar que múltiples iglesias utilicen la plataforma sin que ninguna pueda leer, editar ni eliminar los datos de otra congregación.

---

## 1. Modelo de Datos Multi-Tenant

En una arquitectura Multi-Tenant, cada recurso (canciones, setlists dominicales, histórico y configuración) pertenece obligatoriamente a una iglesia identificada por su `churchId` (`iglesiaId`).

```
                [ PLATAFORMA WORSHIP MANAGER ]
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
  [ IGLESIA A ]                           [ IGLESIA B ]
  churchId: "church_gracia_8x1"           churchId: "church_vidanueva_9y2"
         │                                       │
  ├── 🎵 Canciones de Iglesia A           ├── 🎵 Canciones de Iglesia B
  ├── 📋 Setlists de Iglesia A            ├── 📋 Setlists de Iglesia B
  ├── 📅 Histórico de Iglesia A           ├── 📅 Histórico de Iglesia B
  └── ⚙️ Configuración Iglesia A          └── ⚙️ Configuración Iglesia B
```

---

## 2. Implementación en Google Firebase / Cloud Firestore

### 2.1 Estructura de Subcolecciones Jerárquicas (Recomendado)
```text
/churches/{churchId}
  ├── /songs/{songId}
  ├── /setlists/{setlistId}
  ├── /history/{historyId}
  └── /members/{userId}
```

### 2.2 Reglas de Seguridad de Firestore (`firestore.rules`)
Las siguientes reglas aprovechan **Firebase Auth Custom Claims** (`churchId`) o verificación de membresía:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar: verifica que el usuario esté autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función auxiliar: verifica que el usuario pertenezca a la iglesia del documento
    function belongsToChurch(churchId) {
      return isAuthenticated() && (
        request.auth.token.churchId == churchId ||
        request.auth.uid == churchId
      );
    }

    // Perfil y datos generales de la iglesia
    match /churches/{churchId} {
      // Cualquier miembro autenticado de esta iglesia puede leer; solo admin puede escribir
      allow read: if belongsToChurch(churchId);
      allow create: if isAuthenticated(); // Al registrar una nueva iglesia
      allow update, delete: if belongsToChurch(churchId) && request.auth.token.role == 'admin';

      // 🎵 Subcolección de Canciones
      match /songs/{songId} {
        allow read, write: if belongsToChurch(churchId);
      }

      // 📋 Subcolección de Setlists
      match /setlists/{setlistId} {
        allow read, write: if belongsToChurch(churchId);
      }

      // 📅 Subcolección de Historial de Cultos
      match /history/{historyId} {
        allow read, write: if belongsToChurch(churchId);
      }
    }
    
    // Denegar todo acceso fuera de las iglesias
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 3. Implementación en Supabase / PostgreSQL con RLS (Row-Level Security)

### 3.1 Esquema SQL de Tablas con Clave Foránea `church_id`
```sql
-- 1. Tabla de Iglesias (Tenants)
CREATE TABLE public.churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subtitle TEXT DEFAULT 'Ministerio de Alabanza',
    admin_email TEXT UNIQUE NOT NULL,
    logo_type TEXT DEFAULT 'preset',
    logo_preset TEXT DEFAULT 'harp',
    custom_logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Canciones por Iglesia
CREATE TABLE public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('alabanza', 'adoracion')),
    original_key TEXT NOT NULL,
    lyrics_and_chords TEXT NOT NULL,
    last_played_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Setlists por Iglesia
CREATE TABLE public.setlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    notes TEXT,
    slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Historial Dominical por Iglesia
CREATE TABLE public.sunday_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    songs JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Políticas de Seguridad RLS en PostgreSQL (Supabase)
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sunday_history ENABLE ROW LEVEL SECURITY;

-- Función para extraer el church_id del JWT del usuario autenticado
CREATE OR REPLACE FUNCTION current_church_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'church_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Política de Aislamiento para CANCIONES:
CREATE POLICY "Aislamiento de canciones por iglesia"
ON public.songs
FOR ALL
TO authenticated
USING (church_id = current_church_id())
WITH CHECK (church_id = current_church_id());

-- Política de Aislamiento para SETLISTS:
CREATE POLICY "Aislamiento de setlists por iglesia"
ON public.setlists
FOR ALL
TO authenticated
USING (church_id = current_church_id())
WITH CHECK (church_id = current_church_id());

-- Política de Aislamiento para HISTORIAL:
CREATE POLICY "Aislamiento de historial por iglesia"
ON public.sunday_history
FOR ALL
TO authenticated
USING (church_id = current_church_id())
WITH CHECK (church_id = current_church_id());
```

---

## 4. Implementación en Almacenamiento Local (PWA Offline-First)

Para uso local y offline sin servidor externo, el servicio `multiTenantService.js` particiona los datos mediante claves con prefijo `churchId`:

- `worship_tenants_registry`: Registro global de congregaciones registradas.
- `worship_active_session`: Contiene el token y el `churchId` activo.
- `worship_tenant_{churchId}_songs`: Canciones exclusivas de esa iglesia.
- `worship_tenant_{churchId}_slots`: Armador dominical exclusivo de esa iglesia.
- `worship_tenant_{churchId}_history`: Historial exclusivo de esa iglesia.
- `worship_tenant_{churchId}_settings`: Identidad y logo exclusivos de esa iglesia.

De esta forma, cuando el líder o músico de la Iglesia A ingresa, **solamente se cargan las claves correspondientes a su `churchId`**, dejando los datos de la Iglesia B completamente inaccesibles e intactos.
