import axios from 'axios';

const api = axios.create({
  // Asegúrate de que esta URL coincida con donde corre tu BFF
  baseURL: 'http://localhost:4000/api/v1',
});

export const documentApi = {
  // Listar todos los documentos para la tabla del Dashboard
  getDocuments: () => api.get('/documents'),
  
  // Subir un archivo
  uploadDocument: (file: File) => {
    const formData = new FormData();    
    formData.append('file', file); 
    
    return api.post('/documents/upload', formData);     
  },
  
  processDocument: (id: string) => api.post(`/documents/${id}/process`)
};