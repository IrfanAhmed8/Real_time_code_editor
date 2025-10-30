# Real_time_code_editor

A real-time collaborative code editor built with React, Socket.IO and a Node/Express server. The app supports live code sync between clients in a room, run/execute code via the Piston API, and shows output in an in-app console.

---

## Features
- Real-time collaborative editing (per-room) via WebSockets
- Run code remotely using the Piston API (server-side)
- Per-room localStorage persistence of code
- Basic user/room management and members list

---

## Quickstart

Prerequisites:
- Node.js (>=16)
- npm

1. Install deps
- Server:
  - cd server
  - npm install
- Client:
  - cd client
  - npm install

2. Run locally
- Start server (from server/):
  - npm start
- Start client (from client/):
  - npm start
- Open the client at http://localhost:3000 (or the host you configured)

---

## Important files & symbols

- Server entry: [server/index.js](server/index.js) — handles Socket.IO events and forwards code execution requests to the Piston API.
  - Contains the socket event constants: [`ACTIONS`](server/index.js)
- Server package config: [server/package.json](server/package.json)
- Client socket initializer: [client/src/socket.js](client/src/socket.js) — exports [`initSocket`](client/src/socket.js)
- Client Action constants: [client/src/Action.js](client/src/Action.js) — contains [`ACTIONS`](client/src/Action.js)
- Editor page and main components:
  - [client/src/component/EditorPage.js](client/src/component/EditorPage.js) — [`EditorPage`](client/src/component/EditorPage.js)
  - [client/src/component/Editor.js](client/src/component/Editor.js) — [`Editor`](client/src/component/Editor.js)
  - [client/src/component/TopBar.js](client/src/component/TopBar.js) — [`TopBar`](client/src/component/TopBar.js)
- Client package config: [client/package.json](client/package.json)

---

## Environment / Configuration

- The client expects a backend URL in `process.env.REACT_APP_BACKEND_URL` (see [client/src/socket.js](client/src/socket.js)). Add a `.env` in `client/`:
  - REACT_APP_BACKEND_URL=http://localhost:5000
- The server listens on PORT (default 5000). CORS origins are configured inside [server/index.js](server/index.js); adjust if you host differently.

---


## Troubleshooting

- Socket connection errors: verify REACT_APP_BACKEND_URL and that the server is reachable and CORS allowed origin matches client host.
- If code execution output doesn't arrive: check server logs (console) from [server/index.js](server/index.js) and verify the Piston API response.

---

## Project structure (top-level)
- [client/](client/) — React app (UI & editor)
- [server/](server/) — Express + Socket.IO server

---


