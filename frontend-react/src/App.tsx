import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './context/SocketContext';
import { UploadBox } from './components/UploadBox/UploadBox';
import type { ProcessedNotification } from './types/socket';
import './App.css';

function App() {
  const { isConnected, socket } = useContext(SocketContext);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {    
    if (!socket) return;

    // Definimos la función de manejo para poder limpiarla después
    const handleNotification = (data: ProcessedNotification) => {
      console.log("¡Evento recibido en React!", data);
      setNotification(`Documento ${data.documentId || data.filename} procesado con éxito!`);
      setTimeout(() => setNotification(null), 10000);
    };
    
    socket.on('document_processed', handleNotification);
    
    return () => {
      socket.off('document_processed', handleNotification);
    };
  }, [socket]);

  return (
    <div className="div_app">
      <h1>Compliance Dashboard</h1>
      
      <p style={{ marginBottom: '20px' }}>
        Estado: 
        <span style={{ color: isConnected ? '#4ade80' : '#f87171', marginLeft: '10px', fontWeight: 'bold' }}>
          {isConnected ? '● Online' : '● Offline'}
        </span>
      </p>

      {notification && (
        <div className="div_notification">
          {notification}
        </div>
      )}

      <UploadBox />
    </div>
  );
}

export default App;