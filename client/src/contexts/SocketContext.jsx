import { createContext, useContext, useEffect, useMemo ,useState} from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);

  useEffect(() => {

    const newSocket = io(`${import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"}`, {
      withCredentials: true
    });
    // console.log(newSocket);

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    return () => {
      newSocket.disconnect();
    };

  }, []);
  // const socket=useMemo(()=> io(`${import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"}`, {
  //   withCredentials: true
  // }));
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};