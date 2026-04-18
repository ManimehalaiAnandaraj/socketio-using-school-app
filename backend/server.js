import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";   
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cookieParser from "cookie-parser";
import { socketHandler } from "./socket/socket.js";

dotenv.config();

const app = express();

/* ✅ CORS */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://socketio-using-school-app.vercel.app",
      "https://socketio-using-school-app-git-main-manimehalais-projects.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ✅ ROUTES */
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

/* ✅ SERVER */
const server = http.createServer(app);

/* ✅ SOCKET */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://socketio-using-school-app.vercel.app",
      "https://socketio-using-school-app-git-main-manimehalais-projects.vercel.app",
    ],
    credentials: true,
  },
});

socketHandler(io);

/* ✅ DB */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ✅ START */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});