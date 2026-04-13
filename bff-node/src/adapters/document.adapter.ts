import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { PaginationLimit, PaginationParams } from '../types/pagination.types';

export class DocumentAdapter {
  private client: AxiosInstance;
  private readonly apiKey = process.env.API_KEY_SECRET || "mi_clave_secreta_super_segura_123";

  constructor() {
    this.client = axios.create({
      baseURL: process.env.DOCUMENT_PROCESSOR_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  checkCoreHealth = async (): Promise<boolean> => {  
    try {
      const response = await this.client.get('/api/v1/health');
      return response.status === 200;
    } catch (error) {
      console.error('Error conectando con el Core de Python:', error);
      return false;
    }
  }
  
  uploadDocument = async (fileBuffer: Buffer, fileName: string, mimeType: string) => {
    try {
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType,
      });

      // El endpoint en Python también debería llevar el prefijo si lo configuraste así
      const response = await this.client.post('/api/v1/documents/upload', form, {
        headers: {
          ...form.getHeaders(),
          'X-API-KEY': this.apiKey
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al subir documento:', error.response?.data || error.message);
      throw new Error('Fallo en la comunicación con el procesador');
    }
  };

  getDocuments = async (page: number = 0, limit: PaginationLimit = 10) => {
   try {
    const skip = (page) * limit;
    const params: PaginationParams = {
      skip: skip,  
      limit: limit
    };    

    const response = await this.client.get('/api/v1/documents', {
      params,
        headers: {          
          'X-API-KEY': this.apiKey
        },
    });
    return response.data;
    } catch (error: any) {
      console.error('Error al obtener documentos:', error.response?.data || error.message);
      throw new Error('No se pudo obtener la lista de documentos');
    }
  };

  getDocumentById = async (id: string) => {
    try {
      const response = await this.client.get(`/api/v1/documents/${id}`, {
        headers: {
          'X-API-KEY': this.apiKey
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error al obtener documento ${id}:`, error.response?.data || error.message);
      throw new Error('Documento no encontrado o error en el core');
    }
  };

  processDocument = async (id: string) => {
    try {      
      const response = await this.client.post(`/api/v1/documents/${id}/process`, null, {
        headers: {
          'X-API-KEY': this.apiKey
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error disparando proceso para ${id}:`, error.response?.data || error.message);
      throw new Error(`No se pudo iniciar el procesamiento del documento ${error.response?.data || error.message}`);
    }
  };

}