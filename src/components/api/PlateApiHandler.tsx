
import React, { useEffect } from 'react';
import { usePlateContext } from '@/context/PlateContext';
import { processExternalPlateRequest } from '@/lib/api';

/**
 * Component that handles API routes within the application
 */
const PlateApiHandler: React.FC = () => {
  const { processIncomingPlate } = usePlateContext();
  
  useEffect(() => {
    // Set up event listener to handle plate detection events
    const handlePlateDetected = (event: CustomEvent<string>) => {
      const plateNumber = event.detail;
      console.log('Plate detected event received:', plateNumber);
      processIncomingPlate(plateNumber);
    };
    
    // Add event listener with type assertion
    window.addEventListener('plateDetected', handlePlateDetected as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('plateDetected', handlePlateDetected as EventListener);
    };
  }, [processIncomingPlate]);
  
  // Register our API handler
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker is not supported in this browser');
      return;
    }

    const setupServiceWorker = async () => {
      try {
        // First, unregister any existing service workers
        console.log('Unregistering existing service workers...');
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          console.log('Service worker unregistered');
        }

        // Create service worker file content
        const swCode = `
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
                          message: \`Plate \${plateNumber} recognized\`,
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
                          message: \`Plate \${plateNumber} not found in system\`
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
        `;

        // Create service worker file
        console.log('Creating service worker file...');
        const swBlob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(swBlob);
        
        // Register service worker
        console.log('Registering service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js', { 
          scope: '/',
          type: 'module'
        });
        
        console.log('Service Worker registered successfully:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };
    
    setupServiceWorker();
    
    // Handle messages from the service worker
    const handleMessage = (event: MessageEvent) => {
      console.log('Message received from service worker:', event.data);
      
      if (event.data && event.data.type === 'PLATE_DETECTED') {
        console.log('Processing plate detection from service worker:', event.data.plateNumber);
        processIncomingPlate(event.data.plateNumber);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    // Clean up
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      
      // Unregister service worker when component unmounts
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
            console.log('Service worker unregistered during cleanup');
          }
        });
      }
    };
  }, [processIncomingPlate]);
  
  return null;
};

export default PlateApiHandler;
