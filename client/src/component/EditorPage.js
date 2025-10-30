
import Editor from "./Editor"
import Client from "./Client"

import axios from "axios";
import { toast } from 'react-hot-toast';
import React, { useEffect, useRef, useState } from "react";
import { initSocket } from "../socket";
import { useNavigate,useLocation,Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import "./Editor.css"
import TopBar from "./TopBar";
function EditorPage() {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const codeRef = useRef("");
  const [clients, setClients] = useState([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [outputVisible, setOutputVisible] = useState(false);
  const [version, setVersion] = useState("*");
  const [isCooldown, setIsCooldown] = useState(false);
  

  // Update codeRef whenever code changes
  useEffect(() => {
    codeRef.current = code;
  }, [code]);
//error handling
  useEffect(() => {
    const handleError = (err) => {
      console.error("socket_error =>", err);
      toast.error("Socket connection failed");
      navigate("/");
    };

    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleError);
      socketRef.current.on("connect_failed", handleError);

      socketRef.current.emit("join", {
        roomId,
        username: location.state?.username,
      });
      //this is for a toast about the user joined
      socketRef.current.on("joined", ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined`);
        }
        //it is used for diplaying them in the side bar.
        setClients(clients);
        
        //when someone enter
        if (codeRef.current) {
          socketRef.current.emit('sync-code', {
            code: codeRef.current,
            socketId,
          });
        }
      });

      socketRef.current.on("disconnected", ({ socketId, username }) => {
        toast.success(`${username} left`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
      socketRef.current.on("code-output", (data) => {
        setOutputVisible(true);
        setOutput(data);
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("code-output");
        socketRef.current.disconnect();
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
      }
    };
  }, [navigate, location.state, roomId]);

  if (!location.state) {
    return <Navigate to="/" />;
  }
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };
  const runCode = () => {
    if (isCooldown) {
      toast.success("Is too many requests. Please wait...  10 seconds cooldown.");
      return;
    }

    // Emit the event
    socketRef.current.emit("Complile-and-run", {
      language,
      code,
      roomId,
      version,
    });

    // Start cooldown
    setIsCooldown(true);
    

    setTimeout(() => {
      setIsCooldown(false);
     
    }, 10000); // 10 seconds
  };
return (
  <div
    className="container-fluid vh-100 d-flex flex-column p-0"
    style={{
      backgroundColor: "#0d1117",
      color: "#f0f6fc",
      overflow: "hidden",
    }}
  >
    {/* ===== TopBar (full width) ===== */}
    <TopBar language={language} setLanguage={setLanguage} runCode={runCode} />

    {/* ===== Main Body (Sidebar + Editor) ===== */}
    <div className="flex-grow-1 d-flex" style={{ minHeight: 0 }}>
      {/* Sidebar */}
      <aside
        className="d-flex flex-column border-end"
        style={{
          width: "240px",
          backgroundColor: "#161b22",
          borderColor: "#30363d",
        }}
      >
        {/* Logo */}
        <div className="text-center py-3 border-bottom border-secondary">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="img-fluid"
            style={{
              maxWidth: "100px",
              filter: "drop-shadow(0 0 6px #00ff88aa)",
            }}
          />
        </div>

        {/* Members List */}
        <div
          className="flex-grow-1 overflow-auto px-3 py-2"
          style={{ fontSize: "0.9rem" }}
        >
          <div className="fw-semibold mb-2 text-secondary text-uppercase">
            Members
          </div>
          <div className="d-flex flex-column gap-2">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        {/* Sidebar Buttons */}
        <div className="border-top border-secondary p-3">
          <button
            onClick={copyRoomId}
            className="btn btn-outline-light w-100 mb-2"
            style={{
              borderRadius: "6px",
              fontWeight: "500",
              fontSize: "0.9rem",
            }}
          >
            Copy Room ID
          </button>
          <button
            onClick={leaveRoom}
            className="btn btn-danger w-100"
            style={{ borderRadius: "6px", fontWeight: "500" }}
          >
            Leave Room
          </button>
        </div>
      </aside>

      {/* Editor Panel */}
      <main className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <div
          className="flex-grow-1 d-flex flex-column border-start"
          style={{
            borderColor: "#30363d",
            backgroundColor: "#0d1117",
            overflow: "hidden",
          }}
        >
          <Editor
            socketRef={socketRef}
            roomId={`${roomId}`}
            onCodeChange={setCode}
            output={output}
            outputVisible={outputVisible}
            setOutputVisible={setOutputVisible}
          />
        </div>
      </main>
    </div>
  </div>
);
}

export default EditorPage;