# SubastaHub: Estrategia de Pricing vs. Competencia

## 💰 MODELOS DE MONETIZACIÓN COMPARADOS

### 1. **MapaSubastas** (Freemium Agresivo)

```
TIER GRATIS
─────────────────────────────────────────────────
- Búsqueda ilimitada
- Filtros básicos (provincia, precio, tipo)
- 3 guardados/mes (limitado)
- Notificaciones por email (limitado)
- Ver risk score básico

CONVERSIÓN: ~5% (agresivo paywall)
ARPU (Average Revenue Per User): ~€8-10/mes

TIER PREMIUM: €9.99/mes
─────────────────────────────────────────────────
- Risk score DETALLADO (legal analysis)
- Reportes PDF downloadables
- Alertas ilimitadas
- Mapa interactivo avanzada
- Acceso a "Professional Services"
  (inspectors, lawyers, negociadores)

CHURN: ~30%/mes (típico SaaS)
RETENTION COHORT 3M: ~40% (medio-bajo)

MONETIZACIÓN: 
- Comisión 10% en servicios de inspectores
- Comisión 15% en reportes legales
- Venta de leads a notarios
```

**Análisis**: Paywall muy temprano = baja conversión pero high ARPU

---

### 2. **AlertaSubastas** (Email Freemium)

```
TIER GRATIS
─────────────────────────────────────────────────
- Email con 3 alertas/mes
- Búsqueda manual en web (rudimentaria)
- Integración básica BOE

CONVERSIÓN: ~2% (email users no quieren pagar)
ARPU: €3-5/mes

TIER PREMIUM: ~€5-10/mes (not clearly published)
─────────────────────────────────────────────────
- Alertas ilimitadas
- Multi-fuente (BOE + Hacienda + SS)
- Filtros guardables
- Sin mapa (web UI es weak)

CHURN: ~40%/mes (email business has low retention)
RETENTION COHORT 3M: ~25% (very low)

MONETIZACIÓN:
- Principalmente email suscripción
- Affiliate comissions en servicios notariales
- Email list renting (probable)
```

**Análisis**: Low touch = high scale pero low ARPU. Revenue stalling.

---

### 3. **SubastasIA** (Modern Freemium - ¿?)

```
TIER GRATIS (PRESUMIDO)
─────────────────────────────────────────────────
- Búsqueda básica BOE only
- Risk score IA (pero sin histórico)
- Alertas limitadas

CONVERSIÓN: ~3-5% (startup, testing)
ARPU: ~€10-15/mes (estimado)

TIER PREMIUM: (No public info)
─────────────────────────────────────────────────
- IA recommendations
- Advanced alerts
- Mapa interactiva
- Mobile push notifications

ESTADO: Early, likely iterating on pricing

MONETIZACIÓN:
- Venture-backed, objetivo es growth no revenue
- Probablemente future comisión en transacciones
- Comisión en servicios (copiar MapaSub)
```

**Análisis**: Startup mode = gratis para crecer, monetización es después

---

### 4. **BOE Portal** (Government - Monopoly Pricing)

```
TIER ÚNICO - 100% GRATIS
─────────────────────────────────────────────────
- Todo libre (es gobierno)
- Búsqueda terriblemente fea
- 0 analytics
- 0 alerts
- No hay modelo de negocio

CONVERSIÓN: N/A (gratis pero la UX es tan mala que nadie lo usa)
ARPU: €0

MONETIZACIÓN:
- Ninguno
- Funded por presupuesto público
```

**Análisis**: Monopolio pero tan malo que genera espacio para competencia

---

### 5. **Catawiki** (Commission-based)

```
TIER ÚNICO - 100% GRATIS PARA BIDDERS
─────────────────────────────────────────────────
- Búsqueda ilimitada
- Recomendaciones algorítmicas
- Alertas ilimitadas
- Forum comunidad
- Verified seller/buyer badges

CONVERSIÓN: N/A (bidders no pagan, sellers pagan)
COMISIÓN: 17-19% sobre precio final (de vendedores)
ARPU: €0 (buyers), €500-5000 (sellers)

MODELO: 2-SIDED MARKETPLACE
RETENTION: Very high (85%+, network effect)

MONETIZACIÓN:
- Comisión sobre transacciones (main)
- Premium seller tier (additional)
- Shipping integrations
```

**Análisis**: Transactional model = highest ARPU pero network effect critical

---

### 6. **Todocolección** (Hybrid Freemium + Comisión)

```
TIER GRATIS (CON ANUNCIOS)
─────────────────────────────────────────────────
- Anuncios limitados/mes
- Búsqueda funcional
- No alertas

CONVERSIÓN: ~8-12% (muy agresiva, 25+ años existe)
ARPU: €2-5/mes

TIER PREMIUM: €2.99/mes
─────────────────────────────────────────────────
- Anuncios sin límite
- Renovación automática
- Envíos integrados
- Stats de ventas
- Comisión reducida (vs. free tier)

COMISIÓN (de sellers): 6-8% (free tier) o 3-5% (premium)
ARPU SELLERS: €100-2000/mes

MONETIZACIÓN:
- Anuncio premium (suscripción)
- Comisión sobre ventas
- Shipping revenue share
- Shipping insurance
```

**Análisis**: Hybrid model = diversified revenue. Best for 2-sided marketplace

---

## 📊 TABLA COMPARATIVA DE PRICING ESTRATEGIA

```
METRICA                 SubastaHub   MapaSub    AlertaSub   SubastasIA   BOE        Catawiki
───────────────────────────────────────────────────────────────────────────────────────────
Acceso gratis          ✅ Total      ⚠️ Limited ✅ Total    ✅ Total     ✅ Total   ✅ Total

Paywall timing         N/A           Mes 1      N/A          Mes 1        N/A        Transactional

Freemium conversion    Target: 15%   5%         2%           3-5%         0%         ~10% (premium)

ARPU (if convert)      ~€10/mes      €9.99      €5-10        €10-15       €0         €50-500/mo (sellers)

Churn expectation      Target: 20%   30%        40%          25%          N/A        5% (marketplace)

Revenue model          Freemium      Freemium   Email sub    Freemium     N/A        Transaction 80%
                       + Services                                          Sub 20%

Comisión en servicios  Planned 10%   Sí (10-15%) No         Probable     N/A        Sí (3-19%)

Customer lifetime value €200-500     €300-600   €100-200     €300-500     €0         €2000-10000

Viral coefficient      Low (~0.3)    Low        Very low     Medium       N/A        High (~1.2)
                                                                                       (network)
```

---

## 🎯 RECOMENDACIÓN: PRICING STRATEGY PARA SUBASTAHUB

### FASE 1 (HOY - Semanas 1-4): 100% GRATIS
```
Objetivo: Crecimiento puro, user acquisition
Convertir: 0%
Users objetivo: 10K
```

✅ **Ventaja**: Vs. MapaSubastas (que cobra desde day 1)  
✅ **Propósito**: Llegar a 10K users antes de que competencia sepa que existimos

---

### FASE 2 (Semanas 5-12): FREEMIUM INTRODUCIDO SUAVE
```
Libre:
- Búsqueda ilimitada
- Watchlist ilimitado
- Risk score básico
- 5 alertas/mes

Premium €9.99/mes:
- Alertas ilimitadas
- Risk score AVANZADO (legal deep-dive)
- Reportes PDF
- Mapa interactivo
- Acceso marketplace inspectores

Convertir: Target 5-8%
```

✅ **Ventaja sobre MapaSub**: Gratis durante 3+ meses, cuando ellos piden € día 1  
✅ **Ventaja sobre AlertaSub**: Web UI moderna, no solo email

---

### FASE 3 (Semanas 13-24): MONETIZACIÓN TRANSACCIONAL
```
Premium tiers IGUAL (€9.99/mes)

NUEVO - Marketplace Inspectores (10% comisión):
- Inspectores pueden vender reportes (€50-200 cada uno)
- SubastaHub toma 10%
- Users pueden buscar/contratar directamente

NUEVO - Legal Services Affiliate:
- Referral a notarios/abogados
- Comisión 5-10% en servicios
- Valorización servicios: €500-2000/caso

Proyección comisión: €20K-50K/mes (si marketplace crece)
```

✅ **Diferenciador**: ÚNICO marketplace de occupancy inspectors + legal services

---

### FASE 4 (6+ meses): ENTERPRISE + INTERNATIONAL

```
Professional Tier: €49/mes
- API access para promotores inmobiliarios
- Bulk exports
- CRM integration
- Portfolio analytics

Enterprise: Custom pricing
- White label
- Multiple markets (Portugal, Italia, Francia)
- Dedicated support

International Expansion: €9.99/mes (same as ES)
- Portugal marketplace
- Italy marketplace
- Francia marketplace

Revenue projection si todo funciona:
- Freemium users: 100K
- Premium suscriptores: 15% = 15K × €9.99 = €150K/mes
- Comisión marketplace: €50K/mes (conservative)
- Professional tier: €100K/mes
- International: €200K/mes (agregado)
- TOTAL: ~€500K/mes = €6M/año

MARGEN: 70% (vs. 40% MapaSub)
```

---

## 🚀 COMPARATIVA: ESCENARIO DE INGRESOS A 1 AÑO

### MapaSubastas (Referencia)
```
Users: 60K
Premium rate: 5% = 3K suscriptores
€9.99/mes × 3K × 12 = €360K/año
+ Comisión servicios: ~€200K/año
TOTAL: ~€560K/año

Problema: Churn alto (30%/mes), crecimiento lento
```

### SubastaHub (Nuestro modelo)
```
Año 1 Phase:
- Meses 1-4: Gratis, 10K users, €0 revenue
- Meses 5-8: Freemium introducido, 20K users, 5% convert = 1K × €9.99 = €50K
- Meses 9-12: Marketplace + professional, 50K users, 8% convert = 4K × €9.99 + comisión = €150K

TOTAL: ~€200K Año 1 (pero trajectory es 3x mejor)

Proyección Year 2:
- 150K+ users
- 10% premium rate = 15K
- €15K × €9.99 × 12 = €1.8M
- + Marketplace comisión: €600K
- + Professional tier: €300K
- TOTAL: ~€2.7M/año

MARGEN: 70%
```

---

## ⚠️ PRICING TRADEOFFS

### Opción A: Aggressive Freemium (Nuestro modelo)
```
PRO:
+ Crecimiento viral (word-of-mouth)
+ Defensible vs. MapaSub (gratis > pago)
+ High lifetime value (marketplace revenue)
+ Network effects (occupancy data = moat)

CONTRA:
- Tarda 5-6 meses en monetizar
- Riesgo de "free users" never converting
- Necesita venture capital para cash burn
- Marketplace es risky (ejecutar es difícil)
```

**RECOMENDACIÓN**: Seguir este modelo. Es el que usa Airbnb/Uber.

---

### Opción B: Early Freemium (MapaSubastas style)
```
PRO:
+ Revenue desde mes 1
+ Clarity on business model
+ Cash flow positivo rápido

CONTRA:
- 5-10x menos usuarios (paywall es barrier)
- Vs. nosotros gratis = perdemos
- Marketplace no funciona sin network
- Vulnerable a free competitor (nosotros)
```

**NO RECOMENDADO**: MapaSub ya lo hace, no vamos a ganar así.

---

### Opción C: Pure Transaction (Catawiki style)
```
PRO:
+ Highest lifetime value (€2000-10000 per user)
+ Strong retention (network effects)
+ Diversified revenue (no dependency en suscripción)

CONTRA:
- Requiere 2-sided marketplace FUNCIONAL
- Inspectores/servicios deben confiar en plataforma
- Tiempos de adopción largos (6-12 meses setup)
- Hard problem: Curaracciones calidad

```

**PARCIALMENTE RECOMENDADO**: Hacer esto en Phase 3, no antes.

---

## 📈 PROYECCIÓN: REVENUE RUNWAY

### Asunciones
```
Year 1:
- User acquisition: 10K (M1-4) → 50K (M12)
- Premium conversion: 5% → 10%
- Average marketplace order: €100
- Marketplace conversion: 1% of users
- Churn: 20%/mes (típico startup)
```

### Proyección
```
MES    USUARIOS  PREMIUM%  PREMIUM$  MARKETPLACE$  TOTAL$    CUMULATIVE$
───────────────────────────────────────────────────────────────────────
1      2K        0%        €0        €0            €0        €0
2      4K        0%        €0        €0            €0        €0
3      8K        2%        €2K       €1K           €3K       €3K
4      10K       3%        €5K       €1K           €6K       €9K
5      15K       5%        €15K      €3K           €18K      €27K
6      20K       5%        €20K      €5K           €25K      €52K
7      25K       6%        €30K      €8K           €38K      €90K
8      30K       7%        €40K      €10K          €50K      €140K
9      35K       8%        €50K      €15K          €65K      €205K
10     40K       8%        €60K      €20K          €80K      €285K
11     45K       9%        €70K      €25K          €95K      €380K
12     50K       10%       €80K      €35K          €115K     €495K
```

**Conclusión**: €500K en año 1, pero la mayoría viene en últimos 4 meses.  
Necesitas **runway de €200-300K** para llegar a mes 8-9 (breakeven).

---

## 🎬 RECOMENDACIÓN FINAL

### ESTRATEGIA ÓPTIMA: "Growth-First, Monetize-Later"

```
MESES 1-4: 100% GRATIS
├─ Objetivo: 10K users
├─ Costo: Focus en Phase 2 (scrapers)
└─ Revenue: €0

MESES 5-8: FREEMIUM SUAVE €9.99
├─ Objetivo: 20-30K users, 5% convert
├─ Revenue: ~€50-80K en Q2
└─ Validar: Premium features son valuadas

MESES 9-12: ADD MARKETPLACE
├─ Objetivo: 50K users, 8-10% convert
├─ Revenue: ~€150-200K en Q3-Q4
├─ Validar: Marketplace traction
└─ FUNDRAISING: Usar traction para Serie A

YEAR 2+: SCALE & INTERNATIONAL
├─ Objetivo: 200K+ users
├─ Revenue: €2-3M/año
└─ Profitabilidad: Camino a €10M ARR
```

### Capital Requerido
```
MVP: €0 (ya hecho)
Phase 2: €20K (scrapers, data eng)
Phase 3: €50K (marketplace, hiring)
First year burn: ~€100-150K (3 FTE salaries)

Total needed: ~€200-250K runway (o VC seed round)
```

### Expected Outcomes (Si todo sale bien)
```
Series A fundraising (mes 12): €1-2M valuation
Year 2 ARR: €2-3M
Year 3 ARR: €8-15M (if marketplace works)
Exit opportunity: €50-200M (strategic or IPO)
```

---

**Documento completado: 2026-06-21**  
**Actualizar cuando launching pricing strategy**
