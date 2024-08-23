import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = process.env.PORT || 8000; // Use the port defined by the hosting provider or default to 8000

const app = express();
const server = createServer(app);

const allowedOrigins = [
  "https://healthcheak.vercel.app", // Production URL
  "http://localhost:3000",          // Development URL
];

// Apply CORS middleware for Express
app.use(
  cors({
    origin: allowedOrigins, // Allow multiple origins
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Apply CORS settings specifically for Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Allow multiple origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", ({ room, message }) => {
    const messageData = { room, message, id: socket.id };
    console.log(messageData);
    socket.to(room).emit("receive-message", messageData);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
