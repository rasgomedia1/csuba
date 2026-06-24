import https from 'https';

const lat = 36.77126974;
const lng = -4.10794878;
const newApiKey = 'AIzaSyAumR7yrs4BLDT-qJuO1JLtX36_zvTC6Tw';

console.log('Testando nueva API key...\n');

// Test Static Maps
const staticMapsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=800x450&markers=color:red%7C${lat},${lng}&key=${newApiKey}`;

console.log('1. Testing Static Maps API:');
console.log('URL:', staticMapsUrl.substring(0, 80) + '...\n');

https.get(staticMapsUrl, (response) => {
  console.log('Status:', response.statusCode);
  
  if (response.statusCode === 200) {
    console.log('✅ Static Maps: OK\n');
  } else {
    console.log('❌ Static Maps: Error', response.statusCode);
    console.log('Response:', response.headers);
    console.log('');
  }
  
  // Test Street View Static
  console.log('2. Testing Street View Static API:');
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${lat},${lng}&key=${newApiKey}`;
  console.log('URL:', streetViewUrl.substring(0, 80) + '...\n');
  
  https.get(streetViewUrl, (response2) => {
    console.log('Status:', response2.statusCode);
    
    if (response2.statusCode === 200) {
      console.log('✅ Street View: OK');
    } else {
      console.log('❌ Street View: Error', response2.statusCode);
    }
  }).on('error', (err) => {
    console.error('Street View error:', err.message);
  });
  
}).on('error', (err) => {
  console.error('Static Maps error:', err.message);
});

// Keep process alive for responses
setTimeout(() => process.exit(0), 5000);
