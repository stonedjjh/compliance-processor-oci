import { useEffect, useState, useCallback } from "react";
import { documentApi } from "../../api/documentApi";
import { useSocket } from "../../hooks/useSocket";
import type { Document } from "../../types/document";
import styles from "./DocumentTable.module.css";
import ReactPaginateModule from "react-paginate";

export const DocumentTable = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const { socket } = useSocket();

  // PAGINACIÓN: Estados necesarios
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Selector: 5, 10, 20

  const ReactPaginate =
    (ReactPaginateModule as any).default || ReactPaginateModule;

  const loadData = useCallback(async () => {
    try {
      const { data } = await documentApi.getDocuments(currentPage, itemsPerPage);
      setTotalDocuments(data.total || data.data?.length || 0);
      const docsArray = Array.isArray(data.data) ? data.data : data.documents || [];      
      setDocuments(docsArray);      
    } catch (err) {
      console.error("Error fetching docs", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Lógica de filtrado de datos para la vista  
  const pageCount = Math.ceil(totalDocuments / itemsPerPage);

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);    
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));    
    setCurrentPage(0);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProcessClick = async (id: string) => {
    try {
      // Llamamos al método que ya tienes en tu adaptador
      await documentApi.processDocument(id);
      loadData();
      // No hace falta actualizar el estado local aquí,
      // el socket 'document_processed' se encargará de cambiar el color a verde.
    } catch (err) {
      console.error("Error al disparar el proceso", err);
    }
  };

  // ESCUCHA EN TIEMPO REAL: El diferencial de calidad
  useEffect(() => {
    if (!socket) return;

    const handleProcessed = (data: any) => {
      const targetId = data.documentId || data.id;

      setDocuments((prev) => {
        // Validamos que prev exista y sea array (por seguridad)
        if (!Array.isArray(prev)) return [];

        const exists = prev.find((d) => d.id === targetId);

        if (exists) {
          return prev.map((d) =>
            d.id === targetId ? { ...d, status: data.status } : d,
          );
        } else {
          // Si no existe, disparamos la recarga pero RETORNAMOS el estado actual
          // para que 'documents' no se vuelva undefined.
          loadData();
          return prev;
        }
      });
    };

    socket.on("document_processed", handleProcessed);

    return () => {
      socket.off("document_processed", handleProcessed);
    };
  }, [socket, loadData]);

  if (loading)
    return <div className={styles.skeleton}>Cargando registros...</div>;

  return (
    <section className={styles.card}>
      <header className={styles.table_header}>
        <div className={styles.header_left}>
          <h3>Monitor de Cumplimiento</h3>
          <span className={styles.count}>{totalDocuments} Archivos</span>
        </div>

        <div className={styles.page_selector}>
          <label htmlFor="rows-per-page">Mostrar:</label>
          <select
            id="rows-per-page"
            value={itemsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <option value={5}>5 registros</option>
            <option value={10}>10 registros</option>
            <option value={20}>20 registros</option>
          </select>
        </div>
      </header>

      <div className={styles.table_wrapper}>
        <table className={styles.modern_table}>
          <colgroup>
            <col className={styles.col_documento} />
            <col className={styles.col_estado} />
            <col className={styles.col_fecha} />
            <col className={styles.col_acciones} />
          </colgroup>
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
                <tr key={`doc-id-${doc.id}`} style={{ height: "55px" }}>
                  <td
                    className={`${styles.filename_cell} ${styles.filename_wrapper}`}
                  >
                    <strong>{doc.filename}</strong>
                    <span className={styles.uuid}>{doc.id.split("-")[0]}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.status_pill} ${styles[doc.status.toLowerCase()]}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    {doc.created_at && !isNaN(Date.parse(doc.created_at))
                      ? new Date(doc.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Procesando..."}
                  </td>
                  <td align="right">
                    {doc.status === "Recibido" ? (
                      <button
                        className={styles.process_btn}
                        onClick={() => handleProcessClick(doc.id)}
                        title="Procesar ahora"
                      >
                        ⚙️
                      </button>
                    ) : (
                      <button
                        className={styles.action_btn}
                        title="Ver detalles"
                      >
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
      <div className={styles.pagination_container}>
        <ReactPaginate
          breakLabel="..."
          nextLabel="Siguiente >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={2}
          pageCount={pageCount}
          previousLabel="< Anterior"
          containerClassName={styles.pagination}
          activeClassName={styles.active}
          pageClassName={styles.page_item}
          previousClassName={styles.page_item}
          nextClassName={styles.page_item}
          breakClassName={styles.page_item}
          disabledClassName={styles.disabled}
          forcePage={currentPage} // Importante para mantener sincronía
        />
      </div>
    </section>
  );
};
