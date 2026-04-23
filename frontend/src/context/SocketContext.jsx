import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }
    const s = io("http://localhost:3001", { auth: { token } });
    s.on("connect", () => console.log("Socket connected"));
    s.on("connect_error", (e) => console.error("Socket error:", e.message));
    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
