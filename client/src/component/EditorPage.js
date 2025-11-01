
import Editor from "./Editor"
import Client from "./Client"

import axios from "axios";
import { toast } from 'react-hot-toast';
import React, { useEffect, useRef, useState } from "react";
import { initSocket } from "../socket";
import { useNavigate,useLocation,Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import TopBar from "./TopBar";
function EditorPage() {
  const socketRef = useRef(null);
  const [adminIds, setAdminIds] = useState([]);

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
      socketRef.current.on("joined", ({ clients, username, socketId,adminIds }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined`);
        }
        //it is used for diplaying them in the side bar.
        setClients(clients);
        setAdminIds(adminIds); 
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
      

  socketRef.current.on("admin-updated", ({ adminIds }) => {
    setAdminIds(adminIds);
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
        socketRef.current.off("joined");
        socketRef.current.off("admin-updated");
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
  const UpdateAdmin = (targetId) => {
    toast.success("You have granted write access to the user.");
      socketRef.current.emit("update-admin", {
        roomId,
        socketId: targetId
      });
    }
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
  className="d-flex flex-column border-end shadow-sm"
  style={{
    width: "260px",
    backgroundColor: "#0d1117",
    borderColor: "#30363d",
    color: "#c9d1d9",
  }}
>
  {/* Logo */}
  <div className="text-center py-3 border-bottom border-secondary">
    <img
      src="/images/logo.png"
      alt="Logo"
      className="img-fluid"
      style={{
        maxWidth: "110px",
        filter: "drop-shadow(0 0 6px #00ff88cc)",
      }}
    />
  </div>

  {/* Members List */}
  <div
    className="flex-grow-1 overflow-auto px-3 py-3"
    style={{ fontSize: "0.9rem" }}
  >
    <div
      className="fw-semibold mb-3 text-secondary text-uppercase"
      style={{ letterSpacing: "1px" }}
    >
      Members
    </div>

    <div className="d-flex flex-column gap-3">
      {clients.map((client) => (
        <div
          key={client.socketId}
          className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3 border position-relative"
          style={{
            backgroundColor:
              adminIds.includes(client.socketId) ? "#161b22" : "transparent",
            borderColor:
              adminIds.includes(client.socketId) ? "#238636" : "#30363d",
            transition: "background 0.2s ease",
          }}
        >
          {/* Username and Badge */}
          <div className="d-flex align-items-center gap-2">
            <Client username={client.username} />
            {adminIds.includes(client.socketId) && (
              <span
                className="badge"
                style={{
                  backgroundColor: "#238636",
                  color: "#fff",
                  fontSize: "0.7rem",
                }}
              >
                Admin
              </span>
            )}
          </div>

          {/* Admin Controls */}
          {adminIds.includes(socketRef.current?.id) &&
            !adminIds.includes(client.socketId) && (
              <div className="d-flex flex-column align-items-right gap-2">
                <button
                  className="btn btn-sm text-light border-0 px-2 py-1"
                  style={{
                    backgroundColor: "#30363d",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    transition: "all 0.2s ease",
                  }}
                  title="Make Admin"
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#238636")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#30363d")
                  }
                  onClick={() => UpdateAdmin(client.socketId)} 
                >
                  
                  👑 Admin
                </button>
                <button
                  className="btn btn-sm text-light border-0 px-2 py-1"
                  style={{
                    backgroundColor: "#30363d",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    transition: "all 0.2s ease",
                  }}
                  title="Enable Write"
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2ea043")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#30363d")
                  }
                   
                >
                  ✍️ Write
                </button>
              </div>
            )}
        </div>
      ))}
    </div>
  </div>

  {/* Sidebar Footer Buttons */}
  <div className="border-top border-secondary p-3">
    <button
      onClick={copyRoomId}
      className="btn w-100 mb-2"
      style={{
        border: "1px solid #00ff88",
        color: "#00ff88",
        borderRadius: "6px",
        fontWeight: "500",
        fontSize: "0.9rem",
        backgroundColor: "transparent",
        transition: "all 0.3s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = "#00ff8833";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      Copy Room ID
    </button>

    <button
      onClick={leaveRoom}
      className="btn btn-danger w-100"
      style={{
        borderRadius: "6px",
        fontWeight: "500",
        fontSize: "0.9rem",
        backgroundColor: "#da3633",
        border: "none",
      }}
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