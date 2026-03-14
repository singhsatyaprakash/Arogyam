import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);

  useEffect(() => {

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      newSocket.disconnect();
    };

  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};