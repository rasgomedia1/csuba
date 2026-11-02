# CSUBA (Consolidador de Subastas) - Instrucciones del Proyecto

## 📌 Resumen Ejecutivo

**Objetivo**: Plataforma web para consolidar información de subastas en España con análisis automático de riesgos, filtros avanzados (incluyendo rango de inversión) y seguimiento personal.

**Stack**: Node.js + React + TypeScript + PostgreSQL + TailwindCSS (100% gratis/open source)

**Fase Actual**: MVP Web (Maqueta completa lista para evaluar navegabilidad)

**Próxima Fase**: Integración de scrapers + Android con React Native

---

## 🏗️ Estructura del Proyecto

```
backend/          # API REST Express + TypeScript
├── src/
│   ├── server.ts           # Punto de entrada
│   ├── routes/             # Endpoints API (auth, auctions, users)
│   ├── services/           # Lógica de negocio (auth, auctions, risk scoring)
│   ├── middleware/         # Auth JWT
│   ├── db/
│   │   ├── connection.ts   # Pool PostgreSQL
│   │   └── schema.sql      # Schema de DB
│   └── scrapers/           # (Phase 2) BOE, Hacienda, SS scrapers
└── .env.example

frontend/         # React 18 + Vite + TailwindCSS
├── src/
│   ├── pages/              # Home, Search, Login, Register, AuctionDetail, Watchlist, Profile
│   ├── components/         # Header, SearchFilters, AuctionCard
│   ├── services/           # Cliente API axios
│   ├── hooks/              # useAuth
│   ├── context/            # AuthContext
│   ├── App.tsx             # Router principal
│   └── main.tsx
├── index.html
└── vite.config.ts

docker-compose.yml # PostgreSQL 15 + Redis 7 (base de datos y cache)
README.md          # Instrucciones de instalación
```

---

## 🔑 Características Implementadas en MVP

### ✅ Autenticación
- Registro de usuarios con email, username y rango de inversión opcional
- Login con JWT (7 días de expiración)
- Context API para estado de usuario
- Persistencia en localStorage

### ✅ Búsqueda y Filtros
- Búsqueda por:
  - **💰 Rango de Precio/Inversión** (precio_inicial min/max)
  - **📍 Provincia** (dropdown con 20+ provincias)
  - **🏠 Tipo de Bien** (Vivienda, Local, Garaje, Terreno, Otro)
  - **📋 Estado de Subasta** (Activa, Completada, Desierta)
  - **👥 Ocupación** (Vacía, Ocupada, Desconocido)
  - **⚠️ Riesgo Máximo** (Bajo 0-20, Moderado 0-40, Medio 0-60, Alto 0-100)
- Ordenar por: Fecha, Precio, Riesgo
- Paginación (limit/offset)

### ✅ Evaluación de Riesgos
- **Risk Score Overall** (0-100): Media ponderada de 3 dimensiones
  - **Legal** (cargas, liens, deudas): hasta 80 puntos
  - **Ocupancia** (occupied=70, unknown=40, empty=10): lógica clara
  - **Mercado** (descuento vs valuación): 10-60 puntos
- **Risk Factors** (array de strings): Razones específicas del riesgo
- Visual badges con colores:
  - Verde ✓ Bajo (0-20)
  - Amarillo ⚠️ Moderado (20-50)
  - Naranja ⚠️⚠️ Alto (50-75)
  - Rojo ❌ Muy Alto (75-100)

### ✅ Perfil de Usuario
- Visualizar email, username, rango de inversión
- Editar preferencias de inversión (mín/máx)
- Base lista para provincia_preferences y property_type_preferences

### ✅ Watchlist (Lista de Guardados)
- Agregar/remover subastas a lista personal
- Visualizar lista de guardados con paginación
- Estado persistente (DB + UI)

### ✅ Detalles de Subasta
- Página completa con:
  - Descripción, precio inicial/estimado/final
  - Datos de ocupación y estado
  - Fechas de subasta
  - Grid de risk scores con colores
  - Lista de factores de riesgo
  - Botón para ver en BOE
  - Agregar/remover de watchlist

### ✅ UI/UX
- TailwindCSS responsive (mobile-first)
- Header con navegación
- Filtros expandibles
- Cards de subasta con preview rápido
- Gradientes y emojis para contexto visual
- Formularios con validación básica

---

## 📡 Endpoints API Completados

```
POST   /api/auth/register          # email, username, password, investmentMin, investmentMax
POST   /api/auth/login             # email, password → token + user

GET    /api/auctions/search        # Búsqueda con filtros
GET    /api/auctions/:id           # Detalles de subasta + risk score
POST   /api/auctions/:id/risk-score # Recalcular score

GET    /api/auctions/watchlist/my-list        # [JWT required]
POST   /api/auctions/:id/watchlist            # [JWT required]
DELETE /api/auctions/:id/watchlist            # [JWT required]

GET    /api/users/profile          # [JWT required]
PUT    /api/users/preferences      # [JWT required]
```

---

## 🎯 Cómo Ejecutar la Maqueta

### Instalación Rápida (sin Docker)

**La BD está en Neon Cloud (PostgreSQL remoto), no necesita Docker local.**

```bash
# 1. Backend
cd backend && npm run dev

# 2. Frontend (en otra terminal)
cd frontend && npm run dev

# 3. Acceder
# Frontend: http://localhost:5174
# Backend: http://localhost:3000
```

### Filtros Disponibles
- **Province**: Con tildes (Málaga, Córdoba, etc.) - matches con datos
- **Property Type**: Español (Vivienda, Local, Garaje, Terreno, Otro)
- **Investment Score**: Default "MUY ALTO" (BAJO, MEDIO, ALTO, MUY_ALTO)
- **Max Minimum Bid**: Default 2000€ - filtra por puja inicial
- **Max Price**: Precio máximo de la propiedad
- **Min Area**: Área mínima en m²
- **Auction Status**: activa, completada, desierta
- **Occupancy**: empty, occupied, unknown

### Flujo de Testing

1. **Registro**: `http://localhost:5173/register`
   - Email: `user@test.com`
   - Usuario: `testuser`
   - Contraseña: `123456`
   - Rango inversión: `5000 - 50000`

2. **Login**: `http://localhost:5173/login`

3. **Búsqueda**: `http://localhost:5173/search`
   - Aplica filtros
   - Verifica que las tarjetas muestren riesgo y detalles
   - Click en "Ver Detalles" para página completa

4. **Watchlist**: `http://localhost:5173/watchlist`
   - Guarda algunas subastas
   - Verifica que aparezcan

5. **Perfil**: `http://localhost:5173/profile`
   - Edita rango de inversión
   - Verifica persistencia

---

## 🔄 Flujo de Datos (Arquitectura)

```
React Component
  ↓ (axios)
API Service (services/api.ts)
  ↓ (HTTP)
Express Route Handler
  ↓
Service Layer (business logic)
  ↓
Database Query (pg.query)
  ↓
PostgreSQL
  ↓ (response)
→ React State → Re-render
```

### Ejemplo: Búsqueda de Subastas

```typescript
// Frontend
Search.tsx → SearchFilters (onFilter) → auctionsAPI.search({filters})
  ↓
// Backend
GET /auctions/search → query builder → searchAuctions() service
  ↓ (SQL)
SELECT * FROM auctions WHERE price_initial BETWEEN X AND Y AND ...
  ↓
response.data.auctions → AuctionCard × N (grid)
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

| Tabla | Campos Clave | Propósito |
|-------|-------------|-----------|
| `users` | id, email, username, password_hash, investment_min, investment_max, province_preferences, property_type_preferences | Autenticación y preferencias |
| `auctions` | id, external_id, title, price_initial, price_estimate, price_final, province, property_type, occupancy_status, risk_score_*, auction_status, auction_end | Catálogo de subastas |
| `auction_details` | id, auction_id, cadastre_ref, liens_count, legal_charges, inspection_period_* | Detalles legales + ocupación |
| `user_tracking` | id, user_id, auction_id, status (watchlist/bidding/won/lost), personal_notes, visited_at | Seguimiento personal |
| `price_history` | id, auction_id, price, price_type (initial/rebaja/final), recorded_at | Histórico de precios |
| `alerts` | id, user_id, auction_id, alert_type, message, is_read | Notificaciones |
| `saved_filters` | id, user_id, filter_name, price_min, price_max, provinces[], ... | Filtros guardados |

**Índices**: province, price, auction_status, risk_score_overall, user_id, auction_id

---

## 🔐 Seguridad

- **Passwords**: Hashed con bcrypt (cost 10)
- **JWT**: HS256, 7 días de expiración
- **CORS**: Habilitado para localhost:5173
- **Input Validation**: En rutas (email, números)
- **SQL Injection**: Prevenido con parameterized queries (pg)

---

## 📝 Notas de Desarrollo

### Datos Simulados
La base de datos inicial está vacía. Para Phase 2:
- Integrar scrapers de BOE
- Poblar auction table con datos reales
- Agregar test data desde seed script

### TypeScript
- Strict mode activado
- Global types en middleware/auth.ts
- Interfaces para entidades

### Estilo
- TailwindCSS clases directas (sin CSS separado)
- Emojis como iconografía (simple, visual)
- Colores: brand-600/700, gray-*, green/yellow/red para status
- Responsive: grid auto (1→2→3 columnas)

### Next Steps (No Implementado Aún)
- [ ] Scrapers de BOE (Puppeteer)
- [ ] Integración Hacienda/SS
- [ ] Normalización de datos
- [ ] Histórico de precios (sincronización)
- [ ] Alertas por email
- [ ] React Native para Android
- [ ] Marketplace de inspecciones
- [ ] Análisis IA de recomendaciones

---

## 🚀 Cómo Extender

### Agregar Nueva Página
```typescript
// frontend/src/pages/NewPage.tsx
export const NewPage: React.FC = () => { /* content */ };

// frontend/src/App.tsx
<Route path="/new-page" element={<NewPage />} />
```

### Agregar Nuevo Endpoint API
```typescript
// backend/src/routes/new.ts
router.get('/endpoint', async (req, res) => { /* handler */ });

// backend/src/server.ts
app.use('/api/new', newRoutes);
```

### Agregar Nuevo Filtro de Búsqueda
1. Actualizar `SearchFilters.tsx` (campo + handleFilterChange)
2. Actualizar `FilterState` interface
3. Agregar lógica SQL en `searchAuctions()` service
4. Regenerar tipos TypeScript

---

## 📊 Métricas de Navegabilidad a Evaluar

**Luego de ejecutar la maqueta, validar:**

1. ✅ **Flujo de autenticación**: Registro → Login → Acceso a búsqueda
2. ✅ **Filtros funcionales**: Cada filtro reduce/cambia resultados
3. ✅ **Filtro de inversión**: Rango min/max limita correctamente
4. ✅ **Risk scores**: Colores y números coherentes
5. ✅ **Detalles de subasta**: Página carga datos completos
6. ✅ **Watchlist**: Guardar/remover persiste
7. ✅ **Responsive**: Mobile/tablet/desktop legible
8. ✅ **Tiempos de carga**: <2s búsqueda, <1s navegación
9. ✅ **Errores**: Mensajes claros (no crashes)
10. ✅ **UX**: Intuitivo (5-year-old test)

---

## 📞 Contacto / Cambios Frecuentes

**Última actualización**: 2026-07-12  
**Versión**: 0.1.0-MVP  
**Estado**: ✅ Maqueta corriendo (BD remota Neon Cloud) + build Android (Capacitor) verificado en emulador

### Estado Actual (2026-07-12)
- ✅ Backend: http://localhost:3000 (conectado a Neon Cloud PostgreSQL)
- ✅ Frontend: http://localhost:5174 (Vite dev server)
- ✅ Base de datos remota funcional con datos reales del BOE (vía Apify) + prueba
- ✅ Todos los endpoints API respondiendo
- ✅ Autenticación JWT, búsqueda con filtros, watchlist, detalles de subasta
- ✅ **App Android** empaquetada con Capacitor (`frontend/android/`), APK debug ~4 MB, verificada en AVD `Pixel_6_API35`

### Integración Apify (BOE)
- El Actor `olican/spain-subastas-boe-catastro` acepta 5 parámetros: `tipoBien`, `provincia` (código INE 2 dígitos), `precioMaximo` (puja mínima máx.), `scoreMinimo`, `maxResultados` (1–50). Ver mapeo en `backend/src/scrapers/boe.ts`.
- **El auto-sync en cada búsqueda está DESACTIVADO** vía `APIFY_SYNC_ENABLED=false` (la cuenta Apify agotó créditos: "Monthly usage hard limit exceeded"). La app funciona sobre la caché en PostgreSQL. Poner `APIFY_SYNC_ENABLED=true` para reactivar cuando haya créditos.

### Filtros de búsqueda (2 niveles)
- **Nivel 1 · Apify** (consulta real al Actor): Tipo de Bien, Provincia, Puja Min hasta (€), Score Mínimo, Máx. Resultados. Defaults: Inmueble · Castellón · 1000 · MUY_ALTO · 10.
- **Nivel 2 · Local** (filtra en el navegador sobre lo ya cargado, sin llamar al backend): Tipo de Propiedad, Tasación Máxima, Ordenar Por, Área Mínima, Puja Mínima desde, texto. Estado de Subasta y Ocupación se eliminaron (siempre Activa / Desconocida).

### Cambios Recientes (2026-07-11/12)
1. ✅ **Apify conectado por filtro**: el Actor recibía `{maxResults}` (campo inexistente); ahora mapea provincia→código INE, `precioMaximo`, `scoreMinimo`. Auto-sync gateado por `APIFY_SYNC_ENABLED`.
2. ✅ **Fix persistencia**: faltaba columna `importe_deposito_eur` (migración 003) e `INSERT` con nº de columnas incorrecto en `services/apify.ts`.
3. ✅ **Ficha (AuctionCard) rediseñada**: cifra principal = **Tasación** (antes Puja Mínima); diseño compacto, etiqueta a la izquierda del valor, sin subheaders.
4. ✅ **Filtros 2 niveles** normalizados a grid responsive; eliminados Estado de Subasta y Ocupación.
5. ✅ **Fix Favoritos**: overlay `SectionNumber` (z-index) bloqueaba el corazón — componente eliminado por completo. Manejo global de 401 (sesión expirada → login). `getUserWatchlist` ahora trae todos los campos (tasación, GPS, etc.).
6. ✅ **Header responsive**: se envuelve en pantalla estrecha (ya no se desborda).
7. ✅ **Icono de app** reemplazado (mazo sobre verde) en todas las densidades mipmap + adaptive + favicon web. Fuente: `frontend/assets-src/app-icon.png`.

### Build Android (Capacitor)
```bash
cd frontend
# 1. Build web apuntando al backend del host visto desde el emulador (10.0.2.2)
VITE_API_URL=http://10.0.2.2:3000/api npm run build   # (localhost para navegador normal)
npx cap sync android
# 2. APK debug (requiere JAVA_HOME al JBR de Android Studio)
cd android && ./gradlew.bat assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```
- `appId`: `com.csuba.app`. Manifest con `usesCleartextTraffic=true` y `androidScheme: http` (en `capacitor.config.ts`) para permitir HTTP a `10.0.2.2` sin bloqueo mixed-content.
- Los assets web copiados (`android/app/src/main/assets/public/`) están gitignored: regenerar con `cap sync` tras `npm run build`.

### Deploy en Vercel (2026-07-17/18)
- ✅ Desplegado en producción: **https://csuba.vercel.app** (proyecto `rasgo-media/csuba`, modelo `services` en `vercel.json`).
- Vinculado vía `vercel link`/`vercel --prod` (CLI), no el flujo "Import Project" del dashboard — ese flujo tenía un bug 500 en `api/v1/integrations/search-repo` del lado de Vercel.
- Variables de entorno declaradas en Production: `DATABASE_URL` (host `-pooler` de Neon), `JWT_SECRET`, `APIFY_API_KEY`, `APIFY_ACTOR_ID`, `APIFY_SYNC_ENABLED=false`.
- Pendiente: apuntar `csuba.rasgomedia.com` (CNAME) al deployment y añadirlo en Vercel → Settings → Domains.

### Identidad de marca (2026-07-18)
- Paleta de `tailwind.config.js` (`brand-*`, `accent-*`) alineada a **rasgomedia.es** (azul `#0066ff` / verde `#00c795`) — ver detalle en el `CLAUDE.md` global, sección "Rasgomedia Brand Identity".
- **Register/Login**: agregado toggle de mostrar/ocultar contraseña (👁️/🙈).
- **Register**: sección "Rango de inversión" reemplazada por selector de plan al crear cuenta — "One Free Search" (free) vs "Donate $5 ?" (donor), persistido en `users.user_plan` (migración `004_add_user_plan.sql`). Sin pasarela de pago conectada todavía (WhyDonate requiere que el usuario cree la cuenta/vincule tarjeta manualmente antes de integrar el enlace de donación).

### Próximos Pasos
- [ ] Configurar cuenta WhyDonate (KYC + tarjeta SEPA, manual) y conectar el botón "Donate $5" a la campaña
- [ ] DNS: CNAME `csuba.rasgomedia.com` → deployment de Vercel
- [ ] Recargar créditos Apify y reactivar `APIFY_SYNC_ENABLED=true`
- [ ] Integración Hacienda/SS
- [ ] Alertas por email
- [ ] Release firmado (AAB) para Play Store

Commit todos los cambios en rama `master` (no en `main`). Tag para releases.
