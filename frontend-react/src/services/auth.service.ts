import axios from 'axios';

// La URL apunta a tu BFF (Node.js)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/auth';

export const authService = {
  /**
   * Envía las credenciales al BFF y guarda el token si es exitoso
   */
  login: async (email: string, password: any) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, { email, password });
      
      if (response.data.access_token) {
        // Guardamos el token y los datos básicos del usuario
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.details || 'Error al iniciar sesión');
    }
  },

  /**
   * Registra un nuevo analista
   */
  register: async (userData: any) => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.details || 'Error en el registro');
    }
  },

  /**
   * Limpia la sesión local
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  /**
   * Obtiene el token actual para las cabeceras de otras peticiones
   */
  getCurrentToken: () => {
    return localStorage.getItem('token');
  }
};