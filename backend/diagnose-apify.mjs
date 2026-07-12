import dotenv from 'dotenv';
import { ApifyClient } from 'apify-client';

dotenv.config();

const apiKey = process.env.APIFY_API_KEY;
const actorId = process.env.APIFY_ACTOR_ID || 'olican/spain-subastas-boe-catastro';

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DIAGNÓSTICO DE CONEXIÓN APIFY');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📋 CONFIGURACIÓN:');
console.log(`  API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : '❌ NO CONFIGURADO'}`);
console.log(`  Actor ID: ${actorId}`);
console.log(`  Timestamp: ${new Date().toISOString()}\n`);

if (!apiKey) {
  console.error('❌ ERROR: APIFY_API_KEY no configurado');
  process.exit(1);
}

const client = new ApifyClient({ token: apiKey });

async function diagnose() {
  try {
    console.log('1️⃣ VERIFICANDO API KEY...');
    console.log(`   ✅ API Key presente: ${apiKey.substring(0, 20)}...`);
    console.log(`   Longitud: ${apiKey.length} caracteres\n`);

    console.log('2️⃣ PROBANDO LLAMADA AL ACTOR...');
    console.log(`   Enviando: { maxResults: 50 }\n`);

    const startTime = Date.now();
    const run = await client.actor(actorId).call({
      maxResults: 50
    });

    const duration = Date.now() - startTime;
    console.log(`   ✅ Llamada completada en ${duration}ms\n`);

    console.log('3️⃣ INFORMACIÓN DEL RUN:');
    console.log(`   Run ID: ${run.id}`);
    console.log(`   Status: ${run.status}`);
    console.log(`   Dataset ID: ${run.defaultDatasetId}`);
    console.log(`   Started: ${run.startedAt}`);
    console.log(`   Ended: ${run.finishedAt}\n`);

    console.log('4️⃣ OBTENIENDO RESULTADOS...');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`   ✅ Items retornados: ${items.length}\n`);

    if (items.length > 0) {
      console.log('5️⃣ MUESTRA DE PRIMER RESULTADO:');
      const firstItem = items[0];
      console.log(JSON.stringify(firstItem, null, 2).substring(0, 500) + '...\n');

      console.log('6️⃣ VARIABLES DISPONIBLES EN PRIMER ITEM:');
      const keys = Object.keys(firstItem);
      keys.forEach(key => {
        console.log(`   • ${key}`);
      });
    } else {
      console.log('5️⃣ ⚠️ ADVERTENCIA: Actor retornó 0 items\n');
      console.log('   Posibles causas:');
      console.log('   • El actor no encuentra subastas con criterios actuales');
      console.log('   • El sitio de BOE está inaccesible');
      console.log('   • El actor requiere parámetros de entrada específicos');
      console.log('   • El actor tiene un timeout\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ ERROR DURANTE DIAGNÓSTICO:');
    console.error(`   ${error.message}\n`);
    console.error('Stack:', error.stack);
  }
}

diagnose();
