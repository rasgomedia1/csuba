# 🧪 CSUBA - Scraper Testing Guide

## 🎯 3 Formas de Testear el Scraper BOE

---

## **Opción 1: Endpoint API (Recomendado)** ⭐

### Paso 1: Verificar que el backend esté corriendo
```bash
curl http://localhost:3000/health
# Debería retornar: {"status":"ok","timestamp":"..."}
```

### Paso 2: Test scraper status
```bash
curl http://localhost:3000/api/scrapers/status
```

**Response esperada:**
```json
{
  "status": "ready",
  "scraper": {
    "name": "BOE Auction Scraper",
    "language": "Python 3.12",
    "status": "configured"
  },
  "endpoints": {
    "test": "POST /api/scrapers/boe/test - Execute scraper and get sample data"
  }
}
```

### Paso 3: Ejecutar scraper
```bash
curl -X POST http://localhost:3000/api/scrapers/boe/test \
  -H "Content-Type: application/json"
```

**Response esperada:**
```json
{
  "status": "success",
  "timestamp": "2026-06-23T21:30:00.000Z",
  "count": 10,
  "auctions": [
    {
      "IDENTIFICADOR": "BOE-00001",
      "TITULO": "Subasta Vivienda Madrid",
      "PROVINCIA": "MADRID",
      "URL": "https://subastas.boe.es/..."
    }
  ],
  "message": "✅ Successfully scraped 10 auctions from BOE"
}
```

---

## **Opción 2: Python Script Directo**

### Paso 1: Navegar a carpeta BOE
```bash
cd D:\work\subasta\scrapers\boe
```

### Paso 2: Ejecutar scraper simplificado
```bash
C:/Users/yos/AppData/Local/Programs/Python/Python312/python.exe scraper_simple.py
```

**Output esperado:**
```
[CSUBA-BOE] Starting simplified scraper at 2026-06-23T21:30:00
[CSUBA-BOE] Base URL: https://subastas.boe.es/subastas_ava.php?...
[CSUBA-BOE] Connecting to BOE...
[CSUBA-BOE] Response received (7740 bytes)
[CSUBA-BOE] Extracted 10 auctions
[CSUBA-BOE] Saved to scraped_auctions.json
[]
```

### Paso 3: Verificar archivo generado
```bash
cat scraped_auctions.json
```

---

## **Opción 3: Scraper Completo (Full Data)**

### Paso 1: Ejecutar getData.py
```bash
cd D:\work\subasta\scrapers\boe
C:/Users/yos/AppData/Local/Programs/Python/Python312/python.exe app/getData.py
```

**Output esperado:**
```
The object has been initialized
There are X links
Scraping auction X of Y...
...
Scraping complete. Found N auctions.
```

### Paso 2: Verificar archivos generados
```bash
ls -lah *.xlsx *.csv *.json
# subastas_output.xlsx  - Excel con todas las subastas
# newbies.csv           - Nuevas subastas encontradas
# subastas.json         - JSON de datos
```

---

## 🔍 Qué Buscar en los Resultados

### ✅ Indicadores de Éxito
```
✅ HTTP 200 en conexión a BOE
✅ Datos parseados correctamente
✅ JSON válido
✅ Archivos generados sin errores
✅ Número de auctions > 0
```

### ⚠️ Advertencias Comunes
```
⚠️  No auctions found
   → URL puede estar expirada
   → Requiere Selenium (JavaScript rendering)
   → BOE cambió estructura HTML

⚠️  Connection timeout
   → BOE server lento
   → Problema de red
   → Reintentar en 1 minuto

⚠️  SSL Warning
   → Normal, no afecta funcionalidad
   → Usar sslmode=verify-full en producción
```

---

## 📊 Datos de Prueba

### Estructura de una Subasta
```json
{
  "IDENTIFICADOR": "BOE-00001",
  "TITULO": "Subasta Vivienda Madrid",
  "PROVINCIA": "MADRID",
  "PRECIO_PUJA": 150000,
  "TASACION": 200000,
  "CANTIDAD_RECLAMADA": 50000,
  "OCUPANCY_STATUS": "Ocupada",
  "URL": "https://subastas.boe.es/detallesubasta/00001",
  "scraped_at": "2026-06-23T21:30:00.000Z"
}
```

### Campos Importantes
```
IDENTIFICADOR    - ID único de la subasta
TITULO           - Descripción de la propiedad
PROVINCIA        - Ubicación geográfica
PRECIO_PUJA      - Precio inicial de pujas
TASACION         - Valuación de la propiedad
OCUPANCY_STATUS  - Ocupada / Vacía / Desconocida
```

---

## 🧪 Test Scenarios

### Escenario 1: Connection Test (1 min)
```bash
# Verificar que BOE es accesible
curl http://localhost:3000/api/scrapers/status
# Esperado: 200 OK
```

### Escenario 2: Quick Test (2 min)
```bash
# Ejecutar scraper simplificado
cd scrapers/boe && python scraper_simple.py
# Esperado: Generó scraped_auctions.json
```

### Escenario 3: Full Integration (5 min)
```bash
# Test endpoint API
curl -X POST http://localhost:3000/api/scrapers/boe/test
# Esperado: JSON con auctions
```

### Escenario 4: Full Scrape (10-30 min)
```bash
# Ejecutar scraper completo
cd scrapers/boe && python app/getData.py
# Esperado: subastas_output.xlsx con 1000+ registros
```

---

## 🔧 Troubleshooting

### Error: Python no encontrado
```bash
# Usar ruta completa
C:/Users/yos/AppData/Local/Programs/Python/Python312/python.exe scraper_simple.py
```

### Error: Módulo no encontrado
```bash
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Error: Connection refused (localhost)
```bash
# Backend no está corriendo
cd backend && npm run dev
# Esperar a que diga: "🚀 Server running on http://localhost:3000"
```

### Error: BOE retorna 403
```bash
# Usar Selenium scraper en lugar de requests
python app/login.py  # Requiere autenticación
```

---

## 📈 Comandos Útiles

```bash
# Test conexión BOE
curl -I https://subastas.boe.es/

# Test salud del backend
curl http://localhost:3000/health

# Test scraper status
curl http://localhost:3000/api/scrapers/status

# Ejecutar scraper
curl -X POST http://localhost:3000/api/scrapers/boe/test

# Ver logs en tiempo real (backend)
cd backend && npm run dev

# Ver contenido JSON
cat scrapers/boe/scraped_auctions.json | head -50

# Contar auctions
grep IDENTIFICADOR scrapers/boe/scraped_auctions.json | wc -l
```

---

## 🎯 Resumen

### **Forma Rápida (2 min)**
```bash
curl -X POST http://localhost:3000/api/scrapers/boe/test
```

### **Forma Detallada (5 min)**
```bash
cd scrapers/boe
python scraper_simple.py
cat scraped_auctions.json
```

### **Forma Completa (30 min)**
```bash
cd scrapers/boe
python app/getData.py
# Abre: subastas_output.xlsx
```

---

**¿Cuál forma prefieres?**
- API Endpoint (recomendado)
- Python directo
- Completo con datos reales

Documentación: Ver `PHASE2_LAUNCH.md` para más detalles.
