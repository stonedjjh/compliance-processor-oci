import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    // Usamos la URL directa para descartar problemas de .env por ahora
    const socketInstance = io('http://localhost:4000/notifications', {
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to BFF');
      setOnline(true);
    });

    socketInstance.on('disconnect', () => setOnline(false));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, online };
};