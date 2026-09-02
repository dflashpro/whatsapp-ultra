// Auto-detect environment: Localhost uses relative proxy, Mobile/Production uses Cloud URL
export const BACKEND_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
    ? 'https://whatsapp-ultra-backend.onrender.com' 
    : '');

export const SOCKET_URL = BACKEND_URL || '/';