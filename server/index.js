const express = require("express");
const app = express();
const mongoose=require("mongoose")
const cors = require("cors");   // 👈 import cors
app.use(cors());                // 👈 allow all origins by default
app.use(express.json()) // to parse JSON requests
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const { exec } = require("child_process");
const fs = require("fs");
const { type } = require("os");
mongoose.connect("mongodb://127.0.0.1:27017/realtime_editor")
.then(()=> console.log("MongoDb connected"))
.catch((err)=> console.log("MongoDb",err))

//schema
const pushRequests=new mongoose.Schema({
    roomId:{
      type:String,
      required:true,
    },
    username:{
      type:String,
    },
    code:{
      type:String,
      required:true,
    }
})

const Push=mongoose.model('pushRequest',pushRequests)
//first one is collection name ,second is schema name
const io = new Server(server, {
  cors: {
    origin: "http://192.168.0.100:3000", 
    methods: ["GET", "POST"],
  },
});
//for postman
// Get pushes for a specific room
app.get("/api/pushRequest/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const pushes = await Push.find({ roomId }); // filter by roomId
    res.json(pushes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  PUSH_REQUEST:"push-request",
};

const userSocketMap = {};
//to get all the socket id there in that group
const getAllConnectedClients=(roomId)=>{
  return Array.from(io.sockets.adapter.rooms.get(roomId) || [] ).map(
    (socketId)=>{
    return {socketId,
    username:userSocketMap[socketId],}
  }
  )
  
}

//difference between user-defined and in built is we dont have to call the in build in client side.
// for example for connecting we connection in client,but we have to call for join,code-sync

//list of activities to be done when a connection is made
//connection is in-built word in library

io.on("connection", (socket) => {
  console.log(`User connected : ${socket.id}`);
  
  socket.on('join', ({roomId, username}) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    
    clients.forEach(({socketId}) => {
      io.to(socketId).emit("joined", {
        clients, // Fixed typo: should be clients not Clients
        username,
        socketId: socket.id,
      });

    });
  });
  
  socket.on("code-change", ({roomId, code}) => {
    socket.to(roomId).emit("code-change", {code}); // Use socket.to instead of socket.in
  });
  
  socket.on('sync-code', ({ socketId, code }) => {
    io.to(socketId).emit('code-change', { code });
  });
  socket.on("push-request", async ({ username, code, roomId }) => {
  try {
    await Push.create({ roomId, username, code });

    const codesWithUsernames = await Push.find({ roomId });

    // Broadcast a new push notification separately
    io.to(roomId).emit("push-notification", { username });

    // Send updated list
    io.to(roomId).emit("get-push-request", codesWithUsernames);
  } catch (err) {
    console.error("Error handling push-request:", err);
  }
});


  
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
});


// ---------------------- CODE RUN ROUTE --------------------
app.post("/run", (req, res) => {
  const { language, code } = req.body;

  if (language === "python") {
    const filename = "temp.py";
    fs.writeFileSync(filename, code);

    exec(`python3 ${filename}`, (error, stdout, stderr) => {
      if (error) {
        return res.json({ output: stderr || error.message });
      }
      res.json({ output: stdout });
    });
  }
  else if(language==="javascript") {
const filename = "temp.py";
    fs.writeFileSync(filename, code);
// javascript run through node
    exec(`node ${filename}`, (error, stdout, stderr) => {
      if (error) {
        return res.json({ output: stderr || error.message });
      }
      res.json({ output: stdout });
    });
  }
 else if (language === "cpp") {   // ✅ match frontend value
  const filename = "temp.cpp";
  const outputFile = process.platform === "win32" ? "temp.exe" : "temp";
  fs.writeFileSync(filename, code);

  const runCommand =
    process.platform === "win32"
      ? `g++ ${filename} -o ${outputFile} && ${outputFile}`
      : `g++ ${filename} -o ${outputFile} && ./temp`;

  exec(runCommand, (error, stdout, stderr) => {
    if (error) {
      return res.json({ output: stderr || error.message });
    }
    res.json({ output: stdout });
  });
}
else if (language === "java") {
  const filename = "Temp.java";  // Java requires class name == filename
  fs.writeFileSync(filename, code);

  // Step 1: Compile, Step 2: Run
  exec(`javac ${filename} && java Temp`, (error, stdout, stderr) => {
    if (error) {
      return res.json({ output: stderr || error.message });
    }
    res.json({ output: stdout });
  });
}

  else {
    res.json({ output: "Language not supported" });
  }
  
});

const PORT=process.env.PORT || 5000;
server.listen(PORT,()=>console.log("server is running"));