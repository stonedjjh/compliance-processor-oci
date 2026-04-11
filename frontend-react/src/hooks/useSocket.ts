import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
    const socketInstance = io(`${socketUrl}/notifications`, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      setOnline(true);
    });

    socketInstance.on("disconnect", () => setOnline(false));

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return { socket, online };
};
