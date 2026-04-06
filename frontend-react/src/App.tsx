import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar/NavBar';
import { UploadBox } from './components/UploadBox/UploadBox';
import { DocumentTable } from './components/DocumentTable/DocumentTable'; // El nuevo componente
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            {/* En la raíz "/" mostramos el Dashboard completo: 
              Subida de archivos + Tabla de monitoreo 
            */}
            <Route 
              path="/" 
              element={
                <>
                  <header style={{ marginBottom: '2rem' }}>
                    <h1>Panel de Control de Cumplimiento</h1>
                    <p style={{ color: '#6b7280' }}>Gestión y validación de documentos en tiempo real.</p>
                  </header>
                  <UploadBox />
                  <DocumentTable />
                </>
              } 
            />
            
            {/* Mantienes la ruta de upload sola por si quieres una vista limpia */}
            <Route path="/upload" element={<UploadBox />} />
            
            {/* Opcional: Ruta para ver la tabla sola */}
            <Route path="/documents" element={<DocumentTable />} />
          </Routes>
        </main>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;