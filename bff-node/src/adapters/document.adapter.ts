import axios, { AxiosInstance } from 'axios';

export class DocumentAdapter {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.DOCUMENT_PROCESSOR_URL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async checkCoreHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/v1/health');
      return response.status === 200;
    } catch (error) {
      console.error('Error conectando con el Core de Python:', error);
      return false;
    }
  }
  
  // Aquí iremos agregando los métodos para subir archivos, etc.
}