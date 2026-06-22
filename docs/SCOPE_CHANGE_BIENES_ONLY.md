# Cambio de Scope: Enfoque SOLO en Bienes Raíces + Vehículos

**Efectivo**: 2026-06-22  
**Razón**: Eliminar complejidad, focusear en mercado principal  
**Impact**: Análisis competitivo simplificado, sin coleccionables

---

## ❌ EXCLUIDAS DEL PROYECTO

```
CATEGORÍAS ELIMINADAS:
├─ Coleccionables (arte, libros, monedas, etc.)
├─ Antiques/vintage
├─ Relojes
├─ Joyas
└─ Cualquier bien no-tangible

APPS EXCLUIDAS DEL ANÁLISIS:
├─ Catawiki (coleccionables)
├─ Todocolección (antiques)
└─ Cualquier app especializada en no-bienes
```

---

## ✅ INCLUIDAS (FOCUS PRINCIPAL)

```
CATEGORÍAS INCLUIDAS:
├─ Casas (apartamentos, chalets, pisos)
├─ Inmuebles (locales comerciales, oficinas, garajes)
├─ Vehículos (coches, motos, camiones)
└─ Terrenos (solar, agrícola, industrial)

CARACTERÍSTICAS:
├─ Auctions judiciales (BOE)
├─ Auctions fiscales (Hacienda)
├─ Auctions administrativas (SS, municipal)
├─ Auctions privadas (opcional, future)
└─ Price range: €1K - €1M típico
```

---

## 🎯 APPS BAJO ANÁLISIS (Bienes SOLO)

### **APP #1: Subastas Públicas** 
- Focus: BOE judicial + tax auctions
- Categorías: Propiedades, vehículos, terrenos
- Rating: 3.1/5 (PROBLEMA: app crashes)

### **APP #2: Milanuncios**
- Focus: Classifieds including vehicles + real estate
- Categorías: Vehículos, inmuebles, locales
- Rating: 4.6/5 (PROBLEMA: 45% fraud en bienes)

### **EXCLUIDAS:**
- ~~Catawiki~~ (coleccionables, no bienes)
- ~~Todocolección~~ (antiques, no bienes)

---

## 📊 SIMPLIFICACIÓN DEL ANÁLISIS

**ANTES (3 apps)**:
- Catawiki (coleccionables)
- Subastas Públicas (bienes)
- Milanuncios (mixed)

**AHORA (2 apps, bienes SOLO)**:
- Subastas Públicas (judicial bienes ✅)
- Milanuncios (vehicles/real estate section)

---

## 💡 IMPLICACIONES

### Para SubastaHub

```
FOCUS CLARO:
- Judicial property auctions (BOE + Hacienda + SS)
- Vehículos subastas
- Terrenos/inmuebles
- Ningún coleccionable

DIFERENCIADORES AHORA MÁS CLAROS:
✅ Risk scoring para PROPIEDADES (occupancy, liens)
✅ Vehicle condition alerts
✅ Cadastre integration (propiedades)
✅ Legal analysis (bienes raíces)
✅ Zero fraud guarantee (especialmente vehículos)
```

### Para Scrapers (Phase 2)

```
BOE SCRAPER:
- Parse propiedades (casas, locales, garajes)
- Parse vehículos
- Parse terrenos
- EXCLUDE: coleccionables, arte

HACIENDA SCRAPER:
- Tax auctions bienes raíces
- EXCLUDE: cualquier non-tangible

SS SCRAPER:
- Benefit seizures (bienes)
- EXCLUDE: servicios, virtual items
```

### Para Análisis de Riesgos

```
FACTORES RELEVANTES (Bienes):
✅ Occupancy status (casa ocupada)
✅ Liens + creditors (propiedad)
✅ Vehicle condition (car auctions)
✅ Cadastre data (real estate)
✅ Municipal debt (inmuebles)
✅ Community fees (pisos)

NO RELEVANTES (Excluidas):
❌ Authentication (coleccionables)
❌ Condition grading (arte)
❌ Rarity/edition (libros)
```

---

## 🎯 BENEFICIOS DEL CAMBIO DE SCOPE

```
1. CLARIDAD:
   └─ No confundir audiencias (coleccionista vs. inversors bienes)

2. SIMPLIFICACIÓN:
   └─ Risk scoring es más straightforward para bienes

3. MARKET FOCUS:
   └─ Bienes = 80% del mercado de subastas España
   └─ Coleccionables = 20% nicho

4. COMPETENCIA CLARA:
   └─ MapaSub, AlertaSub, Subastas Públicas = bienes focus
   └─ Catawiki = diferente mercado

5. MONETIZACIÓN CLEARER:
   └─ Bienes tienen más buyers (inversores)
   └─ Coleccionables = hobby market (smaller ARPU)
```

---

## 📄 DOCUMENTOS ACTUALIZADOS

✅ ANDROID_APPS_ANALYSIS.md → TOP 2 apps (Subastas Públicas, Milanuncios)  
✅ QUICK_COMPARISON.md → Actualizado, sin Catawiki  
✅ EXECUTIVE_SUMMARY_ANDROID.md → Enfoque bienes raíces  
✅ COMPETITIVE_ANALYSIS.md → Catawiki marcada como excluida  

---

## 🔒 DEFINICIÓN FINAL: QUÉ ES SUBASTAHUB

```
SubastaHub = Consolidador de subastas de BIENES RAÍCES + VEHÍCULOS en España

CATEGORÍAS:
├─ Propiedades (pisos, chalets, locales, garajes)
├─ Vehículos (coches, motos, camiones)
├─ Terrenos (solar, agrícola, industrial)
└─ Inmuebles genéricos

FUENTES:
├─ BOE (judicial auctions)
├─ Hacienda (tax auctions)
├─ Seguridad Social (benefit seizures)
└─ Municipal (optional future)

USUARIOS:
├─ Real estate investors
├─ Vehicle buyers
├─ Property developers
└─ Individuals seeking deals

PRICING:
├─ €1K - €1M típicamente
└─ Nada sub-€1K (demasiado chico)

NO INCLUÍDO:
├─ ~~Coleccionables~~
├─ ~~Antigüedades~~
├─ ~~Arte~~
└─ ~~Cualquier bien no-tangible~~
```

---

**Status**: Scope definitivamente definido  
**Efectivo desde**: 2026-06-22  
**Documentos**: Todos actualizados
