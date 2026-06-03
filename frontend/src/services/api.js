let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
} else if (API_URL.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  API_URL = '/api';
}

console.log('[API URL Init] Resolved target endpoint to:', API_URL);

/**
 * Perform raw request operations
 */
const request = async (method, path, body = null, isMultipart = false) => {
  const token = localStorage.getItem('ats_token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = isMultipart ? body : JSON.stringify(body);
  }

  try {
    const url = `${API_URL}${path}`;
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`[API Error] ${method} ${path} failed:`, error.message);
    if (error.message === 'Failed to fetch') {
      throw new Error(`Failed to fetch from ${API_URL}${path}. Please verify the backend is running and reachable.`);
    }
    throw error;
  }
};

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
  
  // Custom multi-part files uploader (Multer friendly)
  upload: (path, formData) => request('POST', path, formData, true),
};

export default api;
export { API_URL };
