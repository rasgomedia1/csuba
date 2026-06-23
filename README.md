# 🏛️ CSUBA - Consolidador de Subastas

**Versión actualizada**: CSUBA (antes SubastaHub)  
**Enfoque**: BOE (Subastas Judiciales) SOLO  
**Setup**: LOCAL ONLY - Sin credenciales en GitHub

Plataforma integral para buscar, consolidar y gestionar subastas judiciales de España desde BOE con análisis automático de riesgos.

## 🎯 Características

- **Búsqueda Avanzada**: Filtra por precio, provincia, tipo de bien, estado y ocupación
- **Filtro de Rango de Inversión**: Define tu presupuesto mínimo y máximo
- **Evaluación Automática de Riesgos**: Análisis de ocupación, cargas legales y factores de mercado
- **Lista de Guardados**: Marca tus propiedades favoritas y recibe actualizaciones
- **Perfil Personalizado**: Define tus preferencias de inversión
- **100% Gratis**: Sin costos ocultos ni suscripciones

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **Cache**: Redis
- **Task Queue**: Bull

### Frontend
- **Framework**: React 18
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Bundler**: Vite
- **Router**: React Router v6

## 📋 Requisitos Previos

- Node.js 18+
- Docker Desktop (para PostgreSQL y Redis)
- npm o yarn

## 🚀 Instalación y Ejecución

### 1. Clonar y configurar

```bash
# Clonar/navegar al directorio
cd subasta-app

# Crear archivo .env en backend
cp backend/.env.example backend/.env
```

### 2. Levantar base de datos y caché

```bash
# Asegúrate de tener Docker Desktop ejecutándose
docker-compose up -d

# Verifica que los servicios estén funcionando
docker-compose logs -f
```

### 3. Instalar dependencias

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 4. Ejecutar Backend

```bash
cd backend
npm run dev
# El servidor escuchará en http://localhost:3000
```

### 5. En otra terminal, ejecutar Frontend

```bash
cd frontend
npm run dev
# La aplicación estará disponible en http://localhost:5173
```

## 📖 Estructura del Proyecto

```
subasta-app/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Punto de entrada
│   │   ├── db/
│   │   │   ├── connection.ts   # Conexión PostgreSQL
│   │   │   └── schema.sql      # Schema de base de datos
│   │   ├── routes/             # Endpoints API
│   │   ├── services/           # Lógica de negocio
│   │   ├── middleware/         # Middleware (auth, etc)
│   │   └── scrapers/           # Scrapers de BOE
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # Páginas React
│   │   ├── components/         # Componentes reutilizables
│   │   ├── services/           # Cliente API
│   │   ├── hooks/              # Custom hooks
│   │   ├── context/            # Context API
│   │   ├── App.tsx             # Componente raíz
│   │   └── main.tsx            # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
└── docker-compose.yml
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Subastas
- `GET /api/auctions/search` - Buscar subastas (con filtros)
- `GET /api/auctions/:id` - Obtener detalles de subasta
- `POST /api/auctions/:id/risk-score` - Calcular score de riesgo

### Watchlist (protegido)
- `GET /api/auctions/watchlist/my-list` - Obtener lista de guardados
- `POST /api/auctions/:id/watchlist` - Guardar subasta
- `DELETE /api/auctions/:id/watchlist` - Remover de guardados

### Perfil (protegido)
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/preferences` - Actualizar preferencias

## 🔐 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL=postgresql://subasta:subasta@localhost:5432/subasta_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=tu_secreto_super_seguro_aqui
PORT=3000
NODE_ENV=development
```

## 🧪 Testing

```bash
# Backend
cd backend
npm run build
npm run type-check

# Frontend
cd frontend
npm run type-check
```

## 📱 Versión Android (Próxima Fase)

La versión Android se construirá usando **React Native** reutilizando:
- ~60% del código de la interfaz
- 100% de la lógica de servicios API
- TailwindCSS compilado a StyleSheet nativo

## 🗺️ Roadmap

### Phase 1 - MVP (Actual)
- [x] Búsqueda y filtrado
- [x] Evaluación de riesgos básica
- [x] Autenticación y perfiles
- [x] Watchlist personal

### Phase 2 (Semanas 9-12)
- [ ] Integración con BOE scraper
- [ ] Análisis de precios históricos
- [ ] Integración Catastro
- [ ] Notificaciones por email

### Phase 3 (Semanas 13-16)
- [ ] App Android (React Native)
- [ ] Marketplace de inspecciones
- [ ] Recomendaciones IA
- [ ] Reportes PDF

## 🤝 Contribuir

Este es un proyecto en desarrollo activo. Para cambios:

1. Crea un branch para tu feature
2. Commit tus cambios
3. Push y abre un Pull Request

## 📄 Licencia

MIT - Libre para uso educativo y comercial

## 💡 Notas Importantes

- **Modo Desarrollo**: La app usa datos simulados inicialmente
- **Base de Datos**: PostgreSQL se ejecuta en contenedor Docker
- **Seguridad**: Los tokens JWT expiran en 7 días
- **CORS**: Habilitado para localhost:5173 (frontend dev)

## ❓ Preguntas Frecuentes

**P: ¿Dónde vienen los datos de subastas?**
R: En la fase 2 integraremos scrapers de BOE, Hacienda y Seguridad Social.

**P: ¿Es realmente gratis?**
R: Sí, 100% gratis. Monetización futura será opcional (premium features).

**P: ¿Qué navegadores soporta?**
R: Chrome, Firefox, Safari, Edge (últimas 2 versiones).

**P: ¿Puedo usar la API desde mi app?**
R: Sí, está disponible en `http://localhost:3000/api`

## 📞 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

---

**Última actualización**: 2026-06-21  
**Versión**: 0.1.0  
**Estado**: MVP - En Desarrollo Activo
