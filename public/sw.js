
// Service Worker for handling plate API requests and forwarding to .NET backend
console.log('Service Worker started - .NET Backend Integration');

const API_BASE_URL = 'https://your-dotnet-api.com/api';

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
    console.log('API endpoint request detected - forwarding to .NET backend');
    
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
          console.log('Forwarding plate number to .NET backend:', plateNumber);
          
          // Forward the request to the .NET backend
          const backendResponse = await fetch(`${API_BASE_URL}/plates/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plateNumber }),
          });
          
          // Parse the response from the backend
          const responseData = await backendResponse.json();
          
          if (backendResponse.ok) {
            console.log('Successful response from .NET backend:', responseData);
            
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
                message: responseData.message || `Plate ${plateNumber} recognized`,
                data: responseData.data || {
                  plateNumber: plateNumber,
                  timestamp: new Date().toISOString()
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
            console.log('Error response from .NET backend:', responseData);
            return new Response(
              JSON.stringify({
                success: false,
                message: responseData.message || `Error processing plate ${plateNumber}`
              }),
              {
                status: backendResponse.status,
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
