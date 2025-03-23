
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
