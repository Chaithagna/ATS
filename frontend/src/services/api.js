const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`[API Error] ${method} ${path} failed:`, error.message);
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
