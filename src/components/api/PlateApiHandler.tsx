
import React, { useEffect } from 'react';
import { usePlateContext } from '@/context/PlateContext';
import { processExternalPlateRequest } from '@/lib/api';

/**
 * Component that handles API routes within the application
 * This component registers a service worker to handle API requests
 */
const PlateApiHandler: React.FC = () => {
  const { processIncomingPlate } = usePlateContext();
  
  useEffect(() => {
    // Set up event listener to handle plate detection events
    const handlePlateDetected = (event: CustomEvent<string>) => {
      const plateNumber = event.detail;
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
    if ('serviceWorker' in navigator) {
      // Unregister any existing service workers to ensure clean slate
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      }).then(() => {
        // Create a blob with our service worker code
        const swCode = `
          self.addEventListener('fetch', (event) => {
            const url = new URL(event.request.url);
            
            // Check if this is a request to our API endpoint
            if (url.pathname === '/api/plate') {
              event.respondWith(
                (async () => {
                  // Post the request to the client for processing
                  const client = await self.clients.matchAll({type: 'window'});
                  
                  if (client.length > 0) {
                    // Forward the request to be handled by our app
                    const data = await event.request.clone().json();
                    client[0].postMessage({
                      type: 'PLATE_REQUEST',
                      plateNumber: data.plateNumber
                    });
                    
                    // Process the request
                    try {
                      const clonedRequest = event.request.clone();
                      
                      // Only allow POST requests
                      if (clonedRequest.method !== 'POST') {
                        return new Response(
                          JSON.stringify({ 
                            success: false, 
                            message: 'Method not allowed. Use POST.' 
                          }),
                          { 
                            status: 405,
                            headers: { 'Content-Type': 'application/json' }
                          }
                        );
                      }
                      
                      // Parse the JSON body
                      const data = await clonedRequest.json();
                      
                      // Validate the request payload
                      if (!data.plateNumber) {
                        return new Response(
                          JSON.stringify({ 
                            success: false, 
                            message: 'Missing plateNumber in request body' 
                          }),
                          { 
                            status: 400,
                            headers: { 'Content-Type': 'application/json' }
                          }
                        );
                      }
                      
                      const plateNumber = data.plateNumber;
                      
                      // Get the plates from localStorage by asking the client
                      const storedPlates = localStorage.getItem('plates');
                      let plates = [];
                      
                      if (storedPlates) {
                        try {
                          plates = JSON.parse(storedPlates);
                        } catch (error) {
                          console.error('Error parsing plates from localStorage', error);
                        }
                      }
                      
                      // Check if the plate exists in our system
                      const foundPlate = plates.find((p) => p.plateNumber === plateNumber);
                      
                      if (foundPlate) {
                        // Update the timestamp
                        foundPlate.timestamp = new Date().toISOString();
                        
                        // Update localStorage
                        localStorage.setItem('plates', JSON.stringify(plates));
                        
                        // Return successful response
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
                        // Plate not found
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
                    } catch (error) {
                      console.error('Error processing plate request:', error);
                      return new Response(
                        JSON.stringify({ 
                          success: false, 
                          message: 'Error processing request',
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
                  } else {
                    return new Response(
                      JSON.stringify({ 
                        success: false, 
                        message: 'No active clients found to process the request' 
                      }),
                      { 
                        status: 503,
                        headers: { 
                          'Content-Type': 'application/json',
                          'Access-Control-Allow-Origin': '*'
                        }
                      }
                    );
                  }
                })()
              );
            }
          });
          
          self.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PING') {
              event.ports[0].postMessage('PONG');
            }
          });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        // Register the service worker
        navigator.serviceWorker.register(swUrl, { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
    
    // Handle messages from the service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PLATE_REQUEST') {
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
          }
        });
      }
    };
  }, [processIncomingPlate]);
  
  // This component doesn't render anything - it just sets up API handling
  return null;
};

export default PlateApiHandler;
