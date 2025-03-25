
// This file handles API calls to the .NET backend

/**
 * Base URL for the .NET backend API
 * This should be configured based on your environment
 */
const API_BASE_URL = 'https://your-dotnet-api.com/api'; // Replace with your actual .NET API URL

/**
 * Sends a plate number to the .NET backend
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
  try {
    // Call the .NET backend API
    const response = await fetch(`${API_BASE_URL}/plates/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plateNumber }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Error: ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.message || `Plate number ${plateNumber} successfully processed`,
      data: {
        plateNumber,
        childName: data.childName,
        timestamp: data.timestamp || new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error('Error sending plate number to backend:', error);
    return {
      success: false,
      message: 'Failed to connect to backend service',
    };
  }
};

/**
 * Get all plates from the .NET backend
 */
export const getPlates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/plates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || `Error: ${response.status}`, 
        data: [] 
      };
    }

    return { success: true, data: data.plates || [] };
  } catch (error) {
    console.error('Error fetching plates from backend:', error);
    return { 
      success: false, 
      message: 'Failed to connect to backend service', 
      data: [] 
    };
  }
};

/**
 * This function is no longer needed as we're using a real backend now
 * Keeping the function signature for compatibility but redirecting to the real API
 */
export const processExternalPlateRequest = async (request: Request): Promise<Response> => {
  console.log('External plate request intercepted, forwarding to .NET backend');
  
  // Forward the request to the .NET backend
  try {
    // Only handle POST requests
    if (request.method !== 'POST') {
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
    
    // Parse the request body
    const data = await request.json();
    
    if (!data.plateNumber) {
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
    
    // Forward to the real backend
    const result = await sendPlateNumber(data.plateNumber);
    
    if (result.success) {
      // If successful, dispatch the plateDetected event so the UI updates
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('plateDetected', { detail: data.plateNumber });
        window.dispatchEvent(event);
        console.log('Dispatched plateDetected event');
      }
      
      return new Response(
        JSON.stringify(result),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify(result),
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
    console.error('Error forwarding request to backend:', error);
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
};
