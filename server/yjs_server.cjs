const { WebSocketServer } = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

const wss = new WebSocketServer({ port: 1234 });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

console.log("✅ Yjs WebSocket server running on ws://localhost:1234");
