import https from 'https';

const lat = 36.77126974;
const lng = -4.10794878;
const apiKey = 'AIzaSyBMQXNJL5iRWnM6XiMhUzKBqPvSmD1Pk-s';

const url = `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${lat},${lng}&heading=0&pitch=0&key=${apiKey}`;

console.log('Probando URL de Street View...\n');
console.log('URL:', url.substring(0, 100) + '...\n');

https.get(url, (response) => {
  console.log('Status:', response.statusCode);
  console.log('Headers:', {
    'content-type': response.headers['content-type'],
    'content-length': response.headers['content-length']
  });

  if (response.statusCode === 200) {
    console.log('\n✅ URL válido - Street View disponible');
  } else {
    console.log('\n❌ Error:', response.statusCode);
    console.log('Posibles razones:');
    console.log('  - API key inválida');
    console.log('  - Street View API no habilitada');
    console.log('  - Ubicación sin Street View');
  }
}).on('error', (err) => {
  console.error('Error en request:', err.message);
});
