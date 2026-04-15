import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import { socketHandler } from "./socket/socket.js"; 

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://socketio-using-school-2376qzmfu-manimehalais-projects.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Create server
const server = http.createServer(app);

// Socket setup
const io = new Server(server, {
  cors: {
    origin: "http://socketio-using-school-app.vercel.app",
    credentials: true,
  },
});

// CALL HANDLER
socketHandler(io);

// DB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB Connected");
});

// Start
server.listen(5000, () => {
  console.log("Server running on port 5000");
});