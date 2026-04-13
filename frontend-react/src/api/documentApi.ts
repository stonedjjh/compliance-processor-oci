import api from "./axios.config";

export const documentApi = {
  // Listar todos los documentos para la tabla del Dashboard
  getDocuments: (currentPage: number, itemsPerPage: number) => {
    const page = currentPage;
    const limit = itemsPerPage;    
    return api.get("/documents", { params: { page, limit } });
  },

  // Subir un archivo
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  processDocument: (id: string) => api.post(`/documents/${id}/process`),
};
