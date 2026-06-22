# SubastaHub Roadmap Revisado - Restricción €100 Total

**Actualizado**: 2026-06-22  
**Restricción**: Inversión máxima €100 (todo el proyecto)  
**Prioridad**: Scrapers (Phase 2) ES CRÍTICA

---

## 📌 PRINCIPIOS

✅ **Todas las tecnologías gratis/open source**  
✅ **Scrapers son el MUST-HAVE**  
✅ **No cloud pagado, no SaaS, no servicios empresariales**  
✅ **Bootstrapped (sin inversión hasta MVP+datos)**  
✅ **GitHub, Railway, Vercel free tiers solamente**  

---

## 🗓️ TIMELINE REVISADO

```
PHASE 1: MVP WEB (Weeks 1-4)
├─ Status: ✅ COMPLETADO
├─ Inversión: €0
├─ Entregables:
│  ├─ React web app (Vite + TailwindCSS)
│  ├─ Express API (Node.js)
│  ├─ PostgreSQL schema
│  ├─ Auth (JWT)
│  ├─ Search + Risk scoring
│  └─ Watchlist
└─ Resultado: Web MVP sin datos (DB vacía)

PHASE 2: SCRAPERS + DATA (Weeks 5-12) 🔴 CRÍTICA
├─ Prioridad: MÁXIMA
├─ Inversión: €0 (Puppeteer es gratis)
├─ Entregables (MUST-HAVE):
│  ├─ BOE scraper (Puppeteer)
│  │  ├─ Real-time updates (cada 6 horas)
│  │  ├─ 50K+ auctions en DB
│  │  └─ Parsing: title, price, dates, province, type
│  │
│  ├─ Hacienda scraper (Puppeteer)
│  │  ├─ Tax authority auctions
│  │  ├─ 10K+ listings
│  │  └─ Ocupancy data parsing
│  │
│  ├─ Social Security scraper (Puppeteer)
│  │  ├─ SS auctions
│  │  ├─ 5K+ listings
│  │  └─ Multi-source aggregation
│  │
│  ├─ Data normalization (Node.js script)
│  │  ├─ Unificar schema entre 3 fuentes
│  │  ├─ Deduplicación (mismo bien, diferentes fuentes)
│  │  └─ Validation + quality checks
│  │
│  ├─ Occupancy data enrichment (optional)
│  │  └─ Parsing from descriptions, ocupancia flags
│  │
│  └─ Performance optimization
│     ├─ Índices en PostgreSQL
│     ├─ Redis caching (scrapers)
│     └─ Batch processing (no overwhelm BOE)
│
├─ Resultado: DB con 65K+ auctions + risk scores
├─ Deployments: Railway (free tier PostgreSQL)
└─ Deadline: ⏰ Week 12 (CRÍTICA)

PHASE 3A: OPTIMIZACIÓN + ESTABILIDAD (Weeks 13-16)
├─ Prioridad: MEDIA
├─ Inversión: €0-50 (optional: custom domain)
├─ Entregables:
│  ├─ Scraper error handling + retries
│  ├─ Alertas cuando scraper falla
│  ├─ Dashboard admin para monitoreo
│  ├─ API rate limiting (no spam BOE)
│  ├─ Improve risk scoring (más factores)
│  └─ Search performance tuning
│
└─ Resultado: Scrapers production-ready

PHASE 3B: FEATURES GRATIS (Weeks 17-20)
├─ Prioridad: BAJA (solo si hay tiempo)
├─ Inversión: €0
├─ Entregables (pick 2-3):
│  ├─ Email alerts (gratis, SendGrid trial)
│  ├─ Price history tracking
│  ├─ Advanced filtering (saved searches)
│  ├─ Admin panel (CRUD auctions)
│  └─ Internationalization (i18n Spanish/English)
│
└─ Resultado: Enhanced MVP

PHASE 4: MONETIZACIÓN (Months 6+)
├─ Prioridad: DESPUÉS de tener tracción
├─ Inversión: €100 (dominio custom)
├─ Estrategia:
│  ├─ Freemium tier: searches + watchlist (FREE)
│  ├─ Premium tier: €9.99/mes (alerts unlimited + risk deep-dive)
│  └─ Future: Marketplace inspectores (comisión 10%)
│
└─ Resultado: Revenue stream activado

ANDROID (POSPUESTO)
├─ Status: ⏸️ NO EN ROADMAP (restricción €100)
├─ Revisitar cuando:
│  ├─ Web tiene 100K+ users
│  ├─ Fundraising completado
│  └─ Team scaling posible
│
└─ Motivo: €80K investment bloqueado por restricción
```

---

## 💰 DESGLOSE DE PRESUPUESTO (€100 TOTAL)

```
ITEM                           COSTO      TOTAL ACUMULADO
────────────────────────────────────────────────────────────
Dominio personalizado          €15-20     €20
Email service (optional)       €0 (trial) €20
CI/CD setup (GitHub)           €0         €20
Monitoring tools               €0         €20
Database backups (external)    €0         €20
Dev tools + misc               €10-20     €40

RESERVE BUFFER                 €60        €100
```

**Realidad**: Probablemente gasten €0-20 (solo dominio if needed)

---

## 🎯 FASE 2 DETALLADA: SCRAPERS (THE CRITICAL PATH)

### Semana 5-6: BOE Scraper

```
OBJETIVO: 50K auctions de BOE en DB

ARQUITECTURA:
├─ Service: backend/src/scrapers/boe.ts
├─ Tech: Puppeteer (headless browser automation)
├─ Schedule: Cada 6 horas (Bull queue)
├─ Fields parseados:
│  ├─ ID (external_id from BOE)
│  ├─ Title
│  ├─ Description
│  ├─ Property type
│  ├─ Province + Municipality
│  ├─ Price initial
│  ├─ Price estimate
│  ├─ Auction dates (start/end)
│  ├─ URL to BOE
│  └─ Status (active/completed/deserted)
│
├─ Edge cases:
│  ├─ BOE CAPTCHA (problema conocido)
│  │  └─ Solución: Rate limit + retries con exponential backoff
│  ├─ JavaScript rendering (BOE es JS-heavy)
│  │  └─ Puppeteer maneja esto
│  └─ Deduplication (scrape múltiples veces mismo item)
│     └─ WHERE external_id = X DO UPDATE
│
└─ Success: 50K+ auctions en table, sin duplicados

CODE SKELETON:
```typescript
// backend/src/scrapers/boe.ts
import puppeteer from 'puppeteer';
import { query } from '../db/connection';

async function scrapeBOE() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport, user agent
  await page.setViewport({ width: 1280, height: 720 });
  await page.setUserAgent('Mozilla/5.0...');
  
  try {
    // Goto BOE search page
    await page.goto('https://subastas.boe.es/', { waitUntil: 'networkidle0' });
    
    // Extract all auction links
    const links = await page.$$eval('a.auction-link', 
      els => els.map(e => e.href)
    );
    
    for (const link of links) {
      const auction = await parseAuctionDetail(page, link);
      await saveToDatabase(auction);
    }
    
  } finally {
    await browser.close();
  }
}

// Run on schedule
import Bull from 'bull';
const scrapeQueue = new Queue('boe-scrape');
scrapeQueue.process(scrapeBOE);

// Trigger every 6 hours
setInterval(() => {
  scrapeQueue.add({}, { repeat: { every: 6 * 60 * 60 * 1000 } });
}, 6 * 60 * 60 * 1000);
```
```

### Semana 7-8: Hacienda + Social Security Scrapers

```
OBJETIVO: 15K auctions (Hacienda 10K + SS 5K)

HACIENDA SCRAPER:
├─ URL: https://www.hacienda.gob.es/
├─ Fields: Similar a BOE
├─ Especial: Tax authority properties
├─ Challenge: Site menos estructurado
├─ Solution: Fallback con Cheerio si Puppeteer falla

SOCIAL SECURITY SCRAPER:
├─ URL: https://www.seg-social.es/
├─ Fields: Benefit seizures
├─ Volume: Más pequeño pero valioso
├─ Challenge: Site anti-scraping más fuerte
├─ Solution: Rate limit agresivo, respeto robots.txt

DATA NORMALIZATION SCRIPT:
├─ Función: Unificar schema entre 3 fuentes
├─ Challenge: Diferentes campos en cada fuente
├─ Solution: 
│  └─ Crear tabla intermedia "raw_auctions"
│  └─ Script que normaliza cada fuente
│  └─ Insertar en tabla "auctions" principal
│
└─ Deduplicación:
   └─ Si misma propiedad en BOE + Hacienda
   └─ Guardar refs pero evitar duplicados
```

### Semana 9-10: Data Quality + Risk Scoring

```
OBJETIVO: Risk scores validados en 65K+ auctions

QUALITY CHECKS:
├─ Validar precios (price > 0)
├─ Validar fechas (end > start)
├─ Validar provincias (existen)
├─ Validar tipos de bien (enum values)
└─ Log errores para debug

RISK SCORING (activar):
├─ Legal risk: liens_count parsing from descriptions
├─ Occupancy risk: "ocupada" keywords detection
├─ Market risk: (price_estimate - price_initial) / price_estimate
└─ Store en DB para búsqueda rápida

PERFORMANCE TUNING:
├─ Crear índices:
│  ├─ INDEX province
│  ├─ INDEX price_initial
│  ├─ INDEX auction_status
│  ├─ INDEX risk_score_overall
│  └─ INDEX (source, external_id) UNIQUE
│
├─ Redis cache:
│  ├─ Cache search results (5 min TTL)
│  ├─ Cache popular provinces
│  └─ Cache risk score calculations
│
└─ Query optimization:
   └─ EXPLAIN ANALYZE tus searches
```

### Semana 11-12: Stabilization + Monitoring

```
OBJETIVO: Scrapers production-ready

ERROR HANDLING:
├─ Retry logic (3 attempts, exponential backoff)
├─ Dead-letter queue (failed items)
├─ Alert cuando scraper no actualiza en 12 horas
└─ Graceful degradation (show cached data if scraper fails)

MONITORING (GRATIS):
├─ GitHub Actions CI/CD (gratis)
│  ├─ Run scraper on schedule
│  ├─ Test data integrity
│  └─ Alert on failures
│
├─ Logs (filesystem o free tier Heroku)
│  └─ Track scraper runs, errors, items processed
│
└─ Dashboard (simple HTML)
   ├─ Last scrape time
   ├─ Items in database
   ├─ Errors last 24 hours
   └─ Average response time

LOAD TESTING:
├─ Simular 1000 concurrent searches
├─ Verify response < 500ms
├─ Verify no DB connection leaks
└─ Verify Redis cache working

LAUNCH CHECKLIST:
├─ ✅ 65K+ auctions in DB
├─ ✅ Risk scores calculated
├─ ✅ Search response < 200ms
├─ ✅ No duplicate entries
├─ ✅ Scraper error handling working
├─ ✅ Email alerts functional (if implemented)
└─ ✅ Production deployment tested
```

---

## 📊 CRITERIOS DE ÉXITO (PHASE 2)

### Week 12 Gate:

```
✅ MUST-HAVE (MVP válido)
├─ 50K+ BOE auctions
├─ 10K+ Hacienda auctions
├─ 5K+ SS auctions
├─ Search responde < 200ms
├─ Risk scores visibles en cards
└─ Watchlist funcional

⚠️ NICE-TO-HAVE (bonus)
├─ Email alerts
├─ Price history tracking
├─ Advanced risk factors
└─ Multi-language UI

❌ OUT OF SCOPE (Phase 3+)
├─ Android app
├─ Marketplace
├─ AI recommendations
└─ International expansion
```

---

## 🚀 DEPLOYMENT GRATUITO (€0)

### Hosting Stack

```
FRONTEND:
├─ Vercel (Next.js/React, gratis)
├─ Custom domain: €15/año optional
└─ CI/CD: GitHub Actions → Vercel (automático)

BACKEND:
├─ Railway (Node.js, gratis tier con $5/mes credit)
├─ Alternativa: Render (gratis pero con sleep)
├─ Alternativa: Heroku (€7/mes si activo)
└─ Mejor: Railway free + $5 credit = €5 total

DATABASE:
├─ Railway PostgreSQL (gratis tier, 100MB)
├─ Alternativa: Supabase (gratis, 500MB)
├─ Alternativa: Neon (gratis, 3GB)
└─ Mejor: Neon free tier (amplía a 3GB)

CACHE (Redis):
├─ Railway Redis (gratis tier)
├─ Alternativa: Upstash (gratis, limited)
└─ Mejor: Railway free

TOTAL HOSTING COST: €0-15/mes
```

### GitHub + CI/CD (Gratis)

```
✅ Free GitHub private repos (no cost)
✅ GitHub Actions (gratis para public repos, pagado para private)
✅ Set up Actions workflow:
   ├─ Run scraper on schedule (every 6 hours)
   ├─ Run tests on every push
   ├─ Deploy to Vercel + Railway
   └─ Alert on failures
```

---

## ⏱️ TIMELINE COMPRESS

```
WEEK 1-2:    Setup repos + initial MVP tests
WEEK 3-4:    BOE scraper MVP (5K auctions)
WEEK 5-6:    Scale BOE to 50K, Hacienda start
WEEK 7-8:    Hacienda to 10K, SS start
WEEK 9-10:   SS to 5K, data normalization
WEEK 11-12:  Risk scoring, performance, stabilization
WEEK 13-20:  Phase 3A (optimization, error handling)

CRITICAL: Week 12 deadline para tener datos funcionales
```

---

## 🎯 AFTER WEEK 12: WHAT CHANGES?

### Si scrapers funcionan ✅

```
USUARIOS VERÁN:
├─ 65K+ real auctions en la app
├─ Búsqueda es útil (datos reales)
├─ Risk scores calculados automáticamente
├─ Watchlist populated with real items
└─ Web app es PRODUCTO REAL

RESULTADO:
├─ Traction (usuarios reales)
├─ Social proof (not empty database)
├─ Leveraging para fundraising
└─ Comparar vs. MapaSubastas ahora viables
```

### Si scrapers fallan ❌

```
❌ MVP sigue vacío (DB = 0 auctions)
❌ Imposible testear search realmente
❌ No hay traction para mostrar
❌ Competencia (MapaSub) ganador por default
└─ → Proyecto muere
```

**Por eso: SCRAPERS SON CRÍTICOS. TODO LO DEMÁS ESPERA.**

---

## 🔒 RESTRICCIONES VIGENTES

- ✅ €100 total máximo
- ✅ Scrapers es prioridad #1
- ✅ Sin inversión cloud pagada
- ✅ Open source solamente
- ✅ Sin SaaS caros
- ✅ Bootstrap mindset

---

**Documento actualizado**: 2026-06-22  
**Revisión**: Alignado con restricción €100  
**Status**: Roadmap vigente
