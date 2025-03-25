
// Service Worker for handling plate API requests
console.log('Service Worker started');

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // Skip waiting to activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim()); // Take control of all clients
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  console.log('Service Worker intercepted request:', url.pathname);
  
  // Check if this is a request to our API endpoint
  if (url.pathname === '/api/plate') {
    console.log('API endpoint request detected');
    
    event.respondWith((async () => {
      try {
        if (event.request.method === 'POST') {
          console.log('Processing POST request to /api/plate');
          
          // Clone the request body
          const requestData = await event.request.clone().json();
          console.log('Request data:', requestData);
          
          // Check for plateNumber in the request
          if (!requestData.plateNumber) {
            console.error('Missing plateNumber in request');
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Missing plateNumber in request body'
              }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                }
              }
            );
          }
          
          const plateNumber = requestData.plateNumber;
          console.log('Processing plate number:', plateNumber);
          
          // Get the plates from localStorage
          const storedPlates = localStorage.getItem('plates');
          let plates = [];
          
          if (storedPlates) {
            try {
              plates = JSON.parse(storedPlates);
              console.log('Retrieved plates from localStorage, count:', plates.length);
            } catch (error) {
              console.error('Error parsing plates from localStorage', error);
            }
          } else {
            console.log('No plates found in localStorage');
          }
          
          // Check if the plate exists in our system
          const foundPlate = plates.find((p) => p.plateNumber === plateNumber);
          
          if (foundPlate) {
            console.log('Plate found:', foundPlate);
            
            // Update the timestamp
            foundPlate.timestamp = new Date().toISOString();
            
            // Update localStorage
            localStorage.setItem('plates', JSON.stringify(plates));
            
            // Notify client about the detected plate
            self.clients.matchAll().then(clients => {
              if (clients && clients.length) {
                clients[0].postMessage({
                  type: 'PLATE_DETECTED',
                  plateNumber: plateNumber
                });
                console.log('Sent plate detection message to client');
              } else {
                console.warn('No active clients found to notify');
              }
            });
            
            return new Response(
              JSON.stringify({
                success: true,
                message: `Plate ${plateNumber} recognized`,
                data: {
                  plateNumber: foundPlate.plateNumber,
                  childName: foundPlate.childName,
                  timestamp: foundPlate.timestamp
                }
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                }
              }
            );
          } else {
            console.log('Plate not found:', plateNumber);
            return new Response(
              JSON.stringify({
                success: false,
                message: `Plate ${plateNumber} not found in system`
              }),
              {
                status: 404,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                }
              }
            );
          }
        } else if (event.request.method === 'OPTIONS') {
          // Handle CORS preflight requests
          return new Response(null, {
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          });
        } else {
          console.warn('Unsupported method for /api/plate:', event.request.method);
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Method not allowed. Use POST.'
            }),
            {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }
      } catch (error) {
        console.error('Error in service worker:', error);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Internal server error',
            error: error.toString()
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
    })());
  }
});
