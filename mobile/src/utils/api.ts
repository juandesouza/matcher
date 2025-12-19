// For physical devices, use your computer's IP address instead of localhost
// Get your IP with: ip addr show | grep "inet " | grep -v "127.0.0.1"
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.110:5173';

// Log API base URL for debugging
console.log('API_BASE_URL:', API_BASE_URL);

interface RequestOptions extends RequestInit {
  body?: any;
}

// FormData detection - ONLY use method detection to avoid accessing FormData before it exists
// Never reference global.FormData or FormData type directly to prevent module load errors
const isFormData = (value: any): boolean => {
  if (!value || typeof value !== 'object') return false;
  
  // ONLY check for FormData methods - this is safe and doesn't require FormData to exist
  const hasAppend = typeof value.append === 'function';
  const hasGetParts = typeof value.getParts === 'function';
  
  // Check constructor name as fallback (safe, doesn't access FormData)
  const hasFormDataConstructor = 
    value.constructor?.name === 'FormData';
  
  // Return true if it has the required methods
  // DO NOT use instanceof check as it requires FormData to exist
  return (hasAppend && hasGetParts) || hasFormDataConstructor;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers = {}, ...fetchOptions } = options;

  // Check if body is FormData
  const bodyIsFormData = isFormData(body);

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      // Don't set Content-Type for FormData - let React Native/fetch set it automatically
      ...(bodyIsFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  if (body) {
    // Don't stringify FormData - pass it directly
    if (bodyIsFormData) {
      config.body = body as any;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`[API Request] ${options.method || 'GET'} ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, config);
    console.log(`[API Response] ${response.status} ${response.statusText} for ${fullUrl}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error(`[API Error] ${response.status}:`, error);
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`[API Request Failed] ${fullUrl}:`, error);
    
    // Improve error messages for network failures
    if (error.message === 'Network request failed' || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
      const errorMessage = `Cannot connect to server at ${API_BASE_URL}.\n\nPlease check:\n1. Backend server is running (npm run dev in web/)\n2. Correct IP address: ${API_BASE_URL}\n3. Device and computer are on same network\n4. Firewall allows connections on port 5173`;
      console.error('[Network Error Details]:', errorMessage);
      throw new Error(errorMessage);
    }
    // Re-throw other errors as-is
    throw error;
  }
}

// Auth endpoints
export const auth = {
  signup: (email: string, password: string, name: string) =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { email, password, name },
    }),
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  testUser: () =>
    apiRequest('/api/auth/test-user', {
      method: 'POST',
    }),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  check: () => apiRequest('/api/auth/check'),
  forgotPassword: (email: string) =>
    apiRequest<{ success: boolean; message: string; resetUrl?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),
  resetPassword: (token: string, password: string) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),
  // Google OAuth - get the OAuth URL from the mobile endpoint
  // Include device_id and device_name for private IP OAuth (required by Google)
  getGoogleAuthUrl: async () => {
    // Get device info for OAuth (required for private IP addresses)
    let deviceId = 'unknown';
    let deviceName = 'Matcher Mobile App';
    
    try {
      // Try to get device info from Expo Constants
      const Constants = require('expo-constants').default;
      if (Constants) {
        deviceId = Constants.installationId || Constants.sessionId || `device_${Date.now()}`;
        deviceName = Constants.deviceName || Constants.deviceId || 'Matcher Mobile App';
      }
    } catch (e) {
      // Fallback if Constants not available
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    
    // Build URL with device parameters
    const url = new URL(`${API_BASE_URL}/api/auth/google/mobile`);
    url.searchParams.set('device_id', deviceId);
    url.searchParams.set('device_name', deviceName);
    
    // Add headers to bypass ngrok warning page (for free tier)
    const headers: HeadersInit = {
      'ngrok-skip-browser-warning': 'true',
    };
    
    try {
      const response = await fetch(url.toString(), { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Google OAuth] Failed to get URL:', response.status, errorText);
        throw new Error(`Failed to get Google OAuth URL: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      if (!data.authUrl) {
        throw new Error('Invalid response from server: missing authUrl');
      }
      return data.authUrl;
    } catch (error: any) {
      console.error('[Google OAuth] Request error:', error);
      if (error.message) {
        throw error;
      }
      throw new Error(`Failed to get Google OAuth URL: ${error.toString()}`);
    }
  },
};

// User endpoints
export const user = {
  getProfile: () => apiRequest('/api/profile'),
  updateProfile: (data: any) =>
    apiRequest('/api/profile', {
      method: 'PUT',
      body: data,
    }),
  setup: (data: any) =>
    apiRequest('/api/setup', {
      method: 'POST',
      body: data,
    }),
  uploadPhoto: (photo: any) => // FormData - using any to avoid type issues in React Native
    apiRequest('/api/upload/photo', {
      method: 'POST',
      body: photo,
      headers: {}, // Let React Native set Content-Type for FormData
    }),
  clearTestData: () => apiRequest('/api/user/clear-test-data', { method: 'POST' }),
};

// Settings endpoints
export const settings = {
  get: () => apiRequest('/api/settings'),
  update: (data: any) =>
    apiRequest('/api/settings', {
      method: 'PUT',
      body: data,
    }),
};

// Location endpoint
export const location = {
  update: (lat: number, lng: number) =>
    apiRequest('/api/location', {
      method: 'PUT',
      body: { lat, lng },
    }),
};

// Cards endpoint
export const cards = {
  get: () => apiRequest('/api/users/cards'),
};

// Swipes endpoint
export const swipes = {
  create: (targetUserId: string, action: 'like' | 'dislike') =>
    apiRequest('/api/swipes', {
      method: 'POST',
      body: { targetUserId, action },
    }),
};

// Matches endpoints
export const matches = {
  getAll: () => apiRequest('/api/matches'),
  getById: (id: string) => apiRequest(`/api/matches/${id}`),
  getChatId: (matchId: string) => apiRequest(`/api/matches/${matchId}/chat`),
};

// Chat endpoints
export const chat = {
  getInfo: (chatId: string) => apiRequest(`/api/chat/${chatId}`),
  getMessages: (chatId: string) => apiRequest(`/api/chat/${chatId}/messages`),
  sendMessage: (chatId: string, content: string, type: string = 'text') =>
    apiRequest(`/api/chat/${chatId}/messages`, {
      method: 'POST',
      body: { content, type },
    }),
  uploadImage: async (chatId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // React Native FormData format
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
      formData.append('name', filename);
      formData.append('type', 'image');
      
      return apiRequest(`/api/chat/${chatId}/upload`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Error preparing image upload:', error);
      throw error;
    }
  },
};

// Subscription endpoints
export const subscription = {
  createCheckout: () =>
    apiRequest('/api/subscribe/create-checkout', {
      method: 'POST',
    }),
  verify: (sessionId: string) =>
    apiRequest('/api/subscribe/verify', {
      method: 'POST',
      body: { sessionId },
    }),
};

// AdSense endpoint
export const adsense = {
  getConfig: () => apiRequest('/api/adsense'),
};
