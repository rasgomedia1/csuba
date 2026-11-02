# CSUBA - Consolidador de Subastas

**Proyecto renombrado a CSUBA** (Consolidador de Subastas)  
**Fecha**: 2026-06-23  
**Status**: Phase 2 - BOE Scraper Integration  
**Scope**: BOE (Subastas Judiciales) SOLO

---

## 📦 Estructura del Proyecto

```
CSUBA/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── scrapers/
│   │   │   └── boe.py         # BOE Scraper Wrapper (Python)
│   │   ├── services/
│   │   ├── routes/
│   │   └── db/
│   ├── .env                    # Backend config (LOCAL ONLY)
│   └── package.json
│
├── frontend/                   # React Vite App
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
│
├── scrapers/boe/              # BOE Scraper (clonado de eduaero/BOE)
│   ├── app/
│   │   ├── getData.py        # Main scraper
│   │   ├── UpdatePujas.py
│   │   └── ...
│   ├── .env                   # BOE credentials (LOCAL ONLY)
│   ├── .env.example           # Template (PUBLIC)
│   ├── requirements.txt
│   └── README.md
│
├── docs/                      # Documentation & Analysis
│   ├── REVISED_ROADMAP_€100_BUDGET.md
│   ├── ANDROID_APPS_ANALYSIS.md
│   ├── COMPETITIVE_ANALYSIS.md
│   └── ...
│
├── docker-compose.yml         # PostgreSQL + Redis
├── .env                       # Main project config (LOCAL ONLY)
├── .env.example              # Template (PUBLIC)
└── .gitignore                # Protects .env files
```

---

## 🚀 Setup Local de CSUBA

### Requisitos
- Node.js 18+
- Python 3.9+
- Docker Desktop
- Git

### Pasos de Instalación

#### 1. Clonar el Repositorio
```bash
git clone <tu-repo-csuba> csuba
cd csuba
```

#### 2. Crear .env Local (Backend)
```bash
cp .env.example .env
# Editar .env con valores reales:
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
# JWT_SECRET=...
```

#### 3. Crear .env Local (BOE Scraper)
```bash
cd scrapers/boe
cp .env.example .env
# Editar .env con credenciales de Dropbox/Email/BOE
nano .env
cd ../..
```

#### 4. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**BOE Scraper:**
```bash
cd scrapers/boe
pip install -r requirements.txt
cd ../..
```

#### 5. Levantar Base de Datos
```bash
docker-compose up -d
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

#### 6. Test BOE Scraper Local
```bash
cd scrapers/boe
python app/getData.py
# Debería generar JSON con auctions
cd ../..
```

#### 7. Ejecutar Backend
```bash
cd backend
npm run dev
# API: http://localhost:3000
cd ..
```

#### 8. Ejecutar Frontend
```bash
cd frontend
npm run dev
# Web: http://localhost:5173
cd ..
```

---

## 🔐 Seguridad: .env Files

### IMPORTANTE: Nunca Committear .env

```bash
# ✅ CORRECTO
git status
# .env no debería aparecer

# ❌ INCORRECTO
git add .env
git commit -m "Add .env"
# 🚨 ESTO EXPONDRÁ CREDENCIALES

# Verificar:
git ls-files | grep .env
# (debería no mostrar nada)
```

### Archivos Protegidos (en .gitignore)

```
.env (raíz)
scrapers/boe/.env
scrapers/boe/credentials.txt
scrapers/boe/email_credentials.txt
scrapers/boe/subastas_following.txt
scrapers/boe/subastas_output.xlsx
```

Estos archivos están en `.gitignore` y NUNCA van a GitHub.

---

## 📝 Configuración de Credenciales

### BOE Scraper (.env)

```bash
# Dropbox (opcional - para backup)
DROPBOX_KEY=<tu-token-aqui>

# Email (para notificaciones)
EMAIL_USER=<tu-email@gmail.com>
EMAIL_PASSWORD=<tu-app-password>  # Usar "App Password" de Google

# BOE (opcional - para tracking de bids)
BOE_EMAIL=<email-boe>
BOE_PASSWORD=<password-boe>
```

### Backend (.env)

```bash
DATABASE_URL=postgresql://subasta:subasta@localhost:5432/subasta_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=tu-secreto-super-seguro-aqui
PORT=3000
NODE_ENV=development

# BOE Scraper integration
BOE_SCRAPER_PATH=/full/path/to/scrapers/boe
```

---

## 🔄 BOE Scraper Integration

El scraper BOE está integrado en `backend/src/scrapers/boe.py`:

```python
from scrapers.boe import run_boe_scraper

# Ejecutar scraper
auctions = run_boe_scraper()
print(f"Scraped {len(auctions)} auctions from BOE")

# Insertar en PostgreSQL
for auction in auctions:
    save_to_database(auction)
```

---

## 📋 Roadmap CSUBA

### Phase 1 (Completado)
✅ MVP Web (React + Express)  
✅ Schema PostgreSQL  
✅ Auth & Search  

### Phase 2 (En Progreso - Weeks 5-12)
⏳ **BOE Scraper Integration**
- [x] Clonar BOE repository
- [x] Configurar .env local
- [x] Test scraper localmente
- [ ] Integrar con backend
- [ ] Parse JSON → PostgreSQL
- [ ] Risk scoring
- [ ] Scale a 65K+ auctions

### Phase 3A (Después Week 12)
⏳ Estabilización de scrapers
- Error handling
- Monitoring
- Logging

### Phase 3B (Si hay tiempo)
⏳ Features opcionales
- Email alerts
- Price history
- Admin panel

---

## 🚫 Nunca Subir a GitHub

**REGLA DE ORO**: CSUBA es LOCAL ONLY para credenciales

```bash
# ✅ PERMITIDO COMMITEAR
git add backend/src/scrapers/boe.py
git add scrapers/boe/.env.example
git add docs/
git add README.md
git commit -m "Add BOE scraper integration"
git push  # OK - no hay secretos

# ❌ PROHIBIDO COMMITEAR
git add .env
git add scrapers/boe/.env
git add scrapers/boe/credentials.txt
# 🚨 ESTO EXPONDRÁ CREDENCIALES - NO HAGAS ESTO
```

---

## 🧪 Testing Local

```bash
# 1. Test BOE scraper
cd scrapers/boe
python app/getData.py

# 2. Test backend API
curl http://localhost:3000/health

# 3. Test search
curl http://localhost:3000/api/auctions/search?province=Madrid

# 4. Test frontend
open http://localhost:5173
```

---

## 📖 Documentación

Ver carpeta `docs/`:
- `REVISED_ROADMAP_€100_BUDGET.md` - Plan detallado
- `ANDROID_APPS_ANALYSIS.md` - Análisis de competencia
- `COMPETITIVE_ANALYSIS.md` - Mercado completo
- `QUICK_COMPARISON.md` - Resumen ejecutivo

---

## ✅ Checklist: Setup Completado

```
□ BOE clonado en scrapers/boe/
□ .env.example creado (PÚBLICO)
□ .env local creado (PRIVADO)
□ .gitignore actualizado
□ Docker running (PostgreSQL + Redis)
□ Backend dependencies instaladas
□ Frontend dependencies instaladas
□ BOE scraper dependencies instaladas
□ BOE scraper testeado localmente
□ Backend corriendo en :3000
□ Frontend corriendo en :5173
□ API respondiendo
□ Git status limpio (sin .env)
```

---

## 🎯 Próximo Paso

**Week 5-12: Phase 2 - BOE Scraper Integration**

```bash
cd backend
npm run dev

# En otra terminal:
cd scrapers/boe
python app/getData.py

# Luego integrar output en PostgreSQL
```

---

**Proyecto**: CSUBA (Consolidador de Subastas)  
**Versión**: 0.1.0 - Phase 2 Local Setup  
**Última actualización**: 2026-06-23  
**Status**: Ready for Phase 2 Development
