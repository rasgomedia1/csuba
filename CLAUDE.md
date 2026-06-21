# SubastaHub - Instrucciones del Proyecto

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

### Instalación Rápida (5 minutos)

```bash
# 1. Iniciar base de datos
docker-compose up -d

# 2. Backend
cd backend && npm install && npm run dev

# 3. Frontend (en otra terminal)
cd frontend && npm install && npm run dev

# 4. Acceder
# Frontend: http://localhost:5173
# Backend: http://localhost:3000/api
# Swagger (opcional): http://localhost:3000/api-docs
```

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

**Última actualización**: 2026-06-21  
**Versión**: 0.1.0-MVP  
**Estado**: Maqueta lista, listos para Phase 2 (Scrapers + Android)

Commit todos los cambios en esta rama `main`. Tag para releases.
