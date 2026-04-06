import { useEffect, useState, useCallback } from 'react';
import { documentApi } from '../../api/documentApi';
import { useSocket } from '../../hooks/useSocket';
import type { Document } from '../../types/document';
import styles from './DocumentTable.module.css';

export const DocumentTable = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const loadData = useCallback(async () => {
    try {
      const { data } = await documentApi.getDocuments();
      setDocuments(data);      
    } catch (err) {
      console.error("Error fetching docs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProcessClick = async (id: string) => {
  try {
    // Llamamos al método que ya tienes en tu adaptador
    await documentApi.processDocument(id);
    // No hace falta actualizar el estado local aquí, 
    // el socket 'document_processed' se encargará de cambiar el color a verde.
  } catch (err) {
    console.error("Error al disparar el proceso", err);
  }
};

  // ESCUCHA EN TIEMPO REAL: El diferencial de calidad
  useEffect(() => {
  if (!socket) return;

  // Escuchamos el evento (asegúrate que el nombre coincida: 'document_processed')
  socket.on('document_processed', (data: any) => {
    setDocuments(prev => {
      // Buscamos si el documento ya está en la lista (para actualizar estado)
      const exists = prev.find(d => d.id === (data.documentId || data.id));
      
      if (exists) {
        return prev.map(d => 
          d.id === (data.documentId || data.id) 
            ? { ...d, status: data.status } 
            : d
        );
      } else {
        // Si es nuevo, creamos el objeto con el formato que espera la tabla
        const newEntry: Document = {
          id: data.documentId || data.id,
          filename: data.filename || 'Archivo nuevo', // El BFF debe enviarlo
          status: data.status,
          created_at: data.timestamp || data.created_at || new Date().toISOString()
        };
        return [newEntry, ...prev];
      }
    });
  });

  return () => { socket.off('document_processed'); };
}, [socket]);



  if (loading) return <div className={styles.skeleton}>Cargando registros...</div>;

  return (
    <section className={styles.card}>
      <header className={styles.table_header}>
        <h3>Monitor de Cumplimiento</h3>
        <span className={styles.count}>{documents.length} Archivos</span>
      </header>

      <div className={styles.table_wrapper}>
        <table className={styles.modern_table}>
          <thead>
            <tr>
              <th>Documento</th>
              <th>Estado de Validación</th>
              <th>Fecha de Registro</th>
              <th align="right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty_state}>
                  No se han encontrado documentos procesados aún.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (                
                <tr key={`doc-id-${doc.id}`}>
                  <td className={styles.filename_cell}>
                    <strong>{doc.filename}</strong>
                    <span className={styles.uuid}>{doc.id.split('-')[0]}</span>
                  </td>
                  <td>
                    <span className={`${styles.status_pill} ${styles[doc.status.toLowerCase()]}`}>
                        {doc.status}
                    </span>
                  </td>
                    <td>
                        {doc.created_at && !isNaN(Date.parse(doc.created_at)) 
                        ? new Date(doc.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : 'Procesando...'}
                    </td>
                  <td align="right">
                    {doc.status === 'Recibido' ? (
                      <button 
                        className={styles.process_btn} 
                        onClick={() => handleProcessClick(doc.id)}
                        title="Procesar ahora"
                      >
                        ⚙️
                      </button>
                    ) : (
                      <button className={styles.action_btn} title="Ver detalles">
                        📄
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};