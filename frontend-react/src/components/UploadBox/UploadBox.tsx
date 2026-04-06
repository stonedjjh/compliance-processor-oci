import React, { useState } from 'react';
import { documentApi } from '../../api/documentApi';
import styles from './UploadBox.module.css';
import axios, { AxiosError } from 'axios';

export const UploadBox = () => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, isError: boolean } | null>(null);
  

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setLoading(true);
    setStatusMessage({ text: "Subiendo archivo...", isError: false });
    try {
      const file = e.target.files[0];
      const { data } = await documentApi.uploadDocument(file);
      setStatusMessage({ text: "Archivo aceptado. Procesando...", isError: false });
      
      // Opcional: Disparar el proceso automáticamente después de subir
      await documentApi.processDocument(data.id);
    } catch (error: unknown) {

      let errorMessage = "Error inesperado en el servidor";

      if (axios.isAxiosError(error)) {
  
        errorMessage = error.response?.data?.message 
                      || error.response?.data?.error 
                      || "Error en la comunicación con el servidor";
      } else if (error instanceof Error) {
        // Si es un error normal de JS (como un error de sintaxis o de red nativo)
        errorMessage = error.message;
      }
      setStatusMessage({ 
      text: `${errorMessage}`, 
      isError: true 
    });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.file_input}>
      <h3>Subir Nuevo Documento</h3>
      <input type="file" onChange={handleFileChange} disabled={loading} />
      {loading && <p>Subiendo y enviando a procesar...</p>}
    </div>
  );
};

