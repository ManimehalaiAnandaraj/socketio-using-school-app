import { io } from "socket.io-client";

// ✅ Connect to backend server
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true, // important for auth/cookies
  transports: ["websocket"], // faster & stable
});

// ✅ Connection success
socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

// ❌ Connection error
socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

// ❌ Disconnect
socket.on("disconnect", () => {
  console.log("⚠️ Disconnected from server");
});

export default socket;