import axios, { AxiosInstance } from "axios";

export class AuthAdapter {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      // Usamos la URL del servicio de Python desde el entorno
      baseURL: process.env.DOCUMENT_PROCESSOR_URL || "http://doc_processor_app:8000",
      headers: {
        "X-API-KEY": process.env.API_KEY_SECRET,
        "Content-Type": "application/json",
      },
    });
  }

  async registerUser(userData: any) {
    try {
      const response = await this.api.post("/api/v1/auth/register", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Error en registro (Core)");
    }
  }

  async validateCredentials(credentials: any) {
    try {
      const response = await this.api.post("/api/v1/auth/validate-credentials", credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Credenciales inválidas (Core)");
    }
  }
}