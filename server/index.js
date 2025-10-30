const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios");


app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://192.168.0.100:3000", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  PUSH_REQUEST: "push-request",
};

// Track connected users
const userSocketMap = {};

// Helper to get all users in a room
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
};

// ---------------------- SOCKET.IO LOGIC ----------------------
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join room
  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // Real-time code change
  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code });
  });

  // Sync code for new users
  socket.on("sync-code", ({ socketId, code }) => {
    io.to(socketId).emit("code-change", { code });
  });



  // Disconnect
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
  socket.on("Complile-and-run", async({ language, code, roomId,version })=>{
    console.log("Received code for execution:", { language, code, roomId,version });
  const response=await axios.post("https://emkc.org/api/v2/piston/execute", {
    language,
    version,
    files: [{ content: code }],
  } );
  console.log("Execution response:", response.data.run.output);
  io.to(roomId).emit("code-output", response.data.run.output);

} );

});
//--Piston Api code execution logic//

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
