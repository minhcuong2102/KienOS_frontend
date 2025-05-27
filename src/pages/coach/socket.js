// socket.js
import { io } from "socket.io-client";

const socket = io("https://kienos-nodejs-j3x1.onrender.com", {
    transports: ["websocket"],
    withCredentials: true,
  });

export default socket;
