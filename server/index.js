const express = require("express");
const app = express();
const cors = require("cors");   // 👈 import cors
app.use(cors());                // 👈 allow all origins by default
app.use(express.json()) // to parse JSON requests
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const { exec } = require("child_process");
const fs = require("fs");

const io = new Server(server, {
  cors: {
    origin: "http://192.168.0.100:3000", 
    methods: ["GET", "POST"],
  },
});

const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
};

const userSocketMap = {};
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
io.on("connection",(socket)=>{
  //making socket connection when user clicks on join.
    console.log(`User connected : ${socket.id}`);
    //join,code-sync are user defined.
    socket.on('join',({roomId,username})=>{
      userSocketMap[socket.id]=username;
      socket.join(roomId);
      const Clients=getAllConnectedClients(roomId);
      Clients.forEach(({socketId})=>{
        io.to(socketId).emit("joined",{
          Clients,
          username,
          socketId: socket.id,
        })
      })
    })
    socket.on("code-change",({roomId,code})=>{
      socket.in(roomId).emit("code-change",{code});
    })
     socket.on('sync-code', ({ socketId, code }) => {
    io.to(socketId).emit('code-change', { code });
  });
    socket.on("disconnecting",()=>{
      const rooms= [...socket.rooms];
      rooms.forEach((roomId)=>{
        socket.in(roomId).emit("disconnected",{
          socketId:socket.id,
          username:userSocketMap[socket.id],
        })
      })
      console.log("user disconnected")
      delete userSocketMap[socket.id]
      socket.leave();
    })
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