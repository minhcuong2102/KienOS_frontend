// socket.js
import { io } from "socket.io-client";

const socket = io("http://192.168.1.6:8888", {
    transports: ["websocket"],
    withCredentials: true,
  });

export default socket;
