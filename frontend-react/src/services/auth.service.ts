import api from "../api/axios.config";

export const authService = {
  /**
   * Envía las credenciales al BFF y guarda el token si es exitoso
   */
  login: async (email: string, password: any) => {
    try {
      const response = await api.post(`/auth/login`, { email, password });

      if (response.data.user) {
        // Solo guardamos los metadatos visuales del usuario, el token ya está seguro en la Cookie
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.details || "Error al iniciar sesión",
      );
    }
  },

  /**
   * Registra un nuevo analista
   */
  register: async (userData: any) => {
    try {
      const response = await api.post(`/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.details || "Error en el registro");
    }
  },

  /**
   * Limpia la sesión local
   */
  logout: async () => {
    try {
      // Llamamos al BFF para que destruya la cookie HttpOnly
      await api.post(`/auth/logout`);
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor", error);
    }
    localStorage.removeItem("user");
  },
};
