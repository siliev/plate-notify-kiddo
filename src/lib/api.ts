
// This file simulates an API service for handling plate number requests

/**
 * Simulates sending a plate number to the system
 * In a real application, this would be an API call to a backend service
 */
export const sendPlateNumber = async (plateNumber: string): Promise<{ 
  success: boolean; 
  message: string;
  data?: { 
    plateNumber: string;
    childName?: string;
    timestamp?: string;
  }
}> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Validate plate number format (simple validation)
  if (!plateNumber || plateNumber.length < 3) {
    return {
      success: false,
      message: 'Invalid plate number format',
    };
  }
  
  // In a real app, this would call your backend API
  // Here we just return a success response
  return {
    success: true,
    message: `Plate number ${plateNumber} successfully processed`,
    data: {
      plateNumber,
      timestamp: new Date().toISOString(),
    }
  };
};

/**
 * Get all plates (for admin panel)
 * In a real application, this would fetch from a database
 */
export const getPlates = async () => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This would typically be fetched from the server
  // We're using localStorage in this demo app
  const storedPlates = localStorage.getItem('plates');
  
  if (!storedPlates) {
    return { success: true, data: [] };
  }
  
  try {
    const plates = JSON.parse(storedPlates);
    return { success: true, data: plates };
  } catch (error) {
    console.error('Error parsing plates from localStorage', error);
    return { success: false, message: 'Error retrieving plates' };
  }
};

/**
 * Process an incoming plate from an external system (like a camera)
 * This is the external API endpoint handler
 */
export const processExternalPlateRequest = async (request: Request): Promise<Response> => {
  // Only allow POST requests
  if (request.method !== 'POST') {
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
  
  try {
    // Parse the JSON body
    const data = await request.json();
    
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
    
    // Get the plates from localStorage
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
    const foundPlate = plates.find((p: any) => p.plateNumber === plateNumber);
    
    if (foundPlate) {
      // Update the timestamp
      foundPlate.timestamp = new Date().toISOString();
      
      // Update localStorage
      localStorage.setItem('plates', JSON.stringify(plates));
      
      // Publish event to the app to update the UI
      const event = new CustomEvent('plateDetected', { detail: plateNumber });
      window.dispatchEvent(event);
      
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
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Plate not found
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Plate ${plateNumber} not found in system` 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error processing plate request:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error processing request' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
