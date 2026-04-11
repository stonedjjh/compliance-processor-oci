import React, { useState, useRef } from "react"; // 1. Importamos useRef
import { documentApi } from "../../api/documentApi";
import styles from "./UploadBox.module.css";
import axios from "axios";

export const UploadBox = () => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Referencia para el input de tipo file
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setLoading(true);
    setStatusMessage({ text: "Subiendo archivo...", isError: false });

    try {
      const file = e.target.files[0];
      // Subimos el documento (esto disparará el Socket con status 'Recibido')
      await documentApi.uploadDocument(file);

      setStatusMessage({ text: "¡Archivo subido con éxito!", isError: false });

      // 2. Limpiar el campo de archivo inmediatamente tras el éxito
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 3. Hacer que el mensaje de éxito desaparezca tras 4 segundos
      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    } catch (error: unknown) {
      let errorMessage = "Error inesperado en el servidor";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error en la comunicación con el servidor";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setStatusMessage({
        text: `${errorMessage}`,
        isError: true,
      });

      // También limpiamos el mensaje de error tras 6 segundos para no ensuciar la UI
      setTimeout(() => {
        setStatusMessage(null);
      }, 6000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.file_input}>
      <h3>Subir Nuevo Documento</h3>
      <input
        ref={fileInputRef} // 4. Asignamos la referencia
        type="file"
        onChange={handleFileChange}
        disabled={loading}
        accept=".txt"
      />

      {/* Contenedor con espacio reservado */}
      <div className={styles.status_container}>
        <p
          className={`${styles.status_message} ${
            statusMessage?.isError ? styles.error : styles.success
          } ${statusMessage ? styles.visible : styles.hidden}`}
        >
          {statusMessage?.text || ""}
        </p>
      </div>
    </div>
  );
};
