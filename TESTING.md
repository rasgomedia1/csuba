# CSUBA Testing Guide

## 🎯 Objetivo
Verificar que CSUBA funciona completamente con:
- ✅ Autenticación (test user)
- ✅ Persistencia de datos de Apify en PostgreSQL
- ✅ Búsqueda y filtros dinámicos
- ✅ Visualización de campos del Catastro (m², año, GPS, score)
- ✅ Búsqueda de texto

---

## 🚀 Quick Start

### 1. **Verificar Servicios Corriendo**

```bash
# Backend en puerto 3000
curl http://localhost:3000/api/auctions/search

# Frontend en puerto 5174
# Abre en navegador: http://localhost:5174
```

---

## 🧪 Testing Steps

### **FASE 1: Sincronizar Datos de Apify a PostgreSQL**

1. **Endpoint para sincronizar datos:**
   ```bash
   curl -X POST http://localhost:3000/api/scrapers/boe/sync-to-db
   ```

   **Expected Response:**
   ```json
   {
     "status": "success",
     "count": 9,
     "apifyRunId": "run_1719175848000",
     "message": "✅ Synced 9 auctions to PostgreSQL database"
   }
   ```

2. **Verifica en la BD:**
   ```sql
   SELECT COUNT(*) FROM auctions;
   -- Debería retornar 9 filas
   
   SELECT external_id, investment_score, property_constructed_sqm
   FROM auctions a
   LEFT JOIN auction_details ad ON a.id = ad.auction_id
   LIMIT 3;
   ```

---

### **FASE 2: Test de Autenticación**

#### 2.1 - Registro (Nuevo Usuario)
1. Abre http://localhost:5174
2. Click **"Crear Cuenta"**
3. Completa:
   - Email: `test2@csuba.com`
   - Username: `testuser2`
   - Password: `test123456`
   - Investment Min: `10000`
   - Investment Max: `200000`
4. Verifica que el usuario se crea

#### 2.2 - Login (Test User)
1. Click **"Iniciar Sesión"**
2. Usa credenciales pre-creadas:
   - Email: `test@csuba.com`
   - Password: `test123456`
3. **Expected:** Redirección a Home page y Header muestra "Mi Lista (test@csuba.com)"

---

### **FASE 3: Búsqueda y Filtros**

#### 3.1 - Búsqueda Básica
1. Haz login con `test@csuba.com`
2. Click **"Buscar"** en Header
3. Verifica que se cargen **9 subastas** de Apify

#### 3.2 - Búsqueda de Texto
1. En el campo de búsqueda escribe: **"Vinaròs"**
2. **Expected:** Filtra subastas con "Vinaròs" en ubicación/descripción
3. Intenta: **"Vivienda"**
4. **Expected:** Filtra por tipo de bien

#### 3.3 - Filtros Avanzados
1. Click **"Más Filtros"** para expandir
2. **Rango de Inversión:** 100,000 - 500,000 €
3. **Provincia:** Castellón
4. **Tipo de Bien:** Vivienda
5. **Score de Inversión:** MUY_ALTO
6. Click **"Aplicar Filtros"**
7. **Expected:** Se muestran 2-3 subastas filtradas

#### 3.4 - Ordenamiento
1. En filtros, cambia "Ordenar por":
   - **Por Precio:** Subastas de menor a mayor €
   - **Por Riesgo:** De bajo a alto riesgo
   - **Por Score:** Mejor inversión primero
2. Verifica que el ordenamiento cambia

---

### **FASE 4: Visualización de Campos Catastro**

1. **En la tarjeta de subasta (AuctionCard), verifica que aparecen:**
   - ✅ Precio inicial (€)
   - ✅ Superficie construida (m²) - si disponible
   - ✅ Año de construcción - si disponible
   - ✅ Score de Inversión (badge 💎)
   - ✅ Status y fecha de cierre

2. **Ejemplo esperado:**
   ```
   URBANA.- ELEMENTO NÚMERO DIEZ
   
   💰 Precio: €113,318
   📍 Castellón Vivienda
   
   📐 Superficie: 143 m²
   🏗️ Año Construcción: 2003
   
   💎 MUY_ALTO | 🔴 Activa | 📅 29/06/2026
   ```

---

### **FASE 5: Detalles de Subasta**

1. **Click en una tarjeta "Ver Detalles"**
2. **Verifica que aparecen:**
   - ✅ Título y descripción completa
   - ✅ Precio inicial, estimado, tasación
   - ✅ Depósito e importe
   - ✅ **Datos del Catastro:**
     - Ref. Catastral
     - Superficie construida (m²)
     - Superficie suelo (m²)
     - Año de construcción
     - Dirección oficial del Catastro
     - Coordenadas GPS
   - ✅ Evaluación de Riesgo (score y factores)
   - ✅ Botón para abrir en BOE
   - ✅ Botón de Guardar/Remover de Watchlist

---

### **FASE 6: Watchlist (Lista de Guardados)**

1. **Guardar subastas:**
   - En búsqueda, click ❤️ "Guardar" en 3 subastas
   - Verifica que el botón cambia a "❤️ Guardada"

2. **Ver Watchlist:**
   - Click en Header "Mi Lista (test@csuba.com)"
   - **Expected:** Muestra las 3 subastas guardadas

3. **Remover de Watchlist:**
   - Click ❌ "Remover" en una subasta
   - Verifica que se elimina de la lista

---

### **FASE 7: Perfil de Usuario**

1. **Click en Header "Perfil"**
2. **Verifica:**
   - ✅ Email: test@csuba.com
   - ✅ Username: testuser
   - ✅ Rango de Inversión: €5,000 - €100,000

3. **Editar Rango:**
   - Cambia a €50,000 - €500,000
   - Click "Guardar Cambios"
   - Recarga página y verifica que persiste

---

### **FASE 8: Responsiveness (Mobile)**

1. **Abre DevTools (F12)**
2. **Toggle Device Toolbar (Ctrl+Shift+M)**
3. **Test en tamaños:**
   - 📱 Mobile (375x667)
   - 📱 Tablet (768x1024)
   - 💻 Desktop (1920x1080)

4. **Verifica en cada tamaño:**
   - ✅ Buscador funciona
   - ✅ Filtros se colapsan
   - ✅ Tarjetas adaptan ancho
   - ✅ Botones accesibles
   - ✅ Textos legibles

---

## ✅ Checklist de Testing

### Backend
- [ ] Migraciones ejecutadas (8 tablas creadas)
- [ ] Usuario test creado (test@csuba.com)
- [ ] Endpoint `/boe/sync-to-db` funciona (9 auctions)
- [ ] Datos persistidos en PostgreSQL
- [ ] Búsqueda con filtros retorna datos correctos
- [ ] Búsqueda de texto funciona
- [ ] Investment_score visible en resultados

### Frontend
- [ ] Login funciona con test user
- [ ] Búsqueda carga 9 subastas
- [ ] Búsqueda de texto filtra correctamente
- [ ] Filtros avanzados funcionan
- [ ] AuctionCard muestra:
  - Precio
  - m² (si disponible)
  - Año construcción (si disponible)
  - Score de inversión
- [ ] Detalles de subasta muestran datos de Catastro
- [ ] Watchlist guarda/elimina subastas
- [ ] Perfil muestra datos de usuario
- [ ] Responsive en mobile/tablet/desktop

### Datos
- [ ] 9 subastas sincronizadas
- [ ] Cada subasta tiene:
  - Precio inicial
  - Provincia + municipio
  - Investment_score
  - m² (mayoría)
  - Año construcción (mayoría)

---

## 🐛 Troubleshooting

### "Ninguna subasta visible"
```bash
# Verifica que las migraciones corrieron
SELECT * FROM information_schema.tables WHERE table_schema='public';

# Verifica que hay datos
SELECT COUNT(*) FROM auctions;
```

### "Error de login"
```bash
# Verifica usuario test existe
SELECT * FROM users WHERE email = 'test@csuba.com';
```

### "Campos del Catastro no aparecen"
```bash
# Verifica que tienen datos
SELECT property_constructed_sqm, property_year_catastro 
FROM auction_details 
WHERE property_constructed_sqm IS NOT NULL;
```

---

## 🎉 Success Criteria

✅ **CSUBA está LISTO si:**
1. Los 9 datos de Apify están en PostgreSQL
2. Login funciona con test user
3. Búsqueda filtra correctamente (texto, provincia, riesgo, precio, etc.)
4. Se muestran datos del Catastro en tarjetas y detalles
5. Watchlist persiste
6. Responsive en todos los tamaños

---

**Última actualización:** 2026-06-24
