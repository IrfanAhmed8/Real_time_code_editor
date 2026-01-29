
import Editor from "./Editor"
import Client from "./Client"


import { toast } from 'react-hot-toast';
import  { useEffect, useRef, useState } from "react";
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
  const COLORS = {
  bgApp: "#0b0f14",
  bgSurface: "#020617",
  bgPanel: "#0f172a",

  border: "#1f2937",

  textPrimary: "#e5e7eb",
  textSecondary: "#9ca3af",

  accent: "#22c55e",
  accentSoft: "rgba(34,197,94,0.15)",

  danger: "#ef4444",
};


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
  style={{
    width: "260px",
    background: COLORS.bgSurface,
    borderRight: `1px solid ${COLORS.border}`,
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* Brand */}
  <div
    style={{
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: `1px solid ${COLORS.border}`,
    }}
  >
    <img src="/images/logo.png" style={{ width: "48px" }} />
  </div>

  {/* Members */}
  <div className="flex-grow-1 px-3 py-3">
    <div
      style={{
        fontSize: "0.75rem",
        color: COLORS.textSecondary,
        marginBottom: "12px",
        letterSpacing: "1px",
      }}
    >
      MEMBERS
    </div>

    {clients.map((client) => (
      <div
        key={client.socketId}
        style={{
          padding: "8px 10px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
          background: adminIds.includes(client.socketId)
            ? "rgba(34,197,94,0.08)"
            : "transparent",
    }}
      >
        <Client username={client.username} />

        {adminIds.includes(client.socketId) && (
          <span
            style={{
              fontSize: "0.65rem",
              color: COLORS.accent,
            }}
          >
            Admin
          </span>
        )}
      </div>
    ))}
  </div>

  {/* Footer */}
  <div
    style={{
      padding: "12px",
      borderTop: `1px solid ${COLORS.border}`,
    }}
  >
    <button
      className="w-100 mb-2"
      style={{
        background: "transparent",
        border: `1px solid ${COLORS.border}`,
        color: COLORS.textSecondary,
        borderRadius: "8px",
        padding: "8px",
      }}
      onClick={copyRoomId}
    >
      Copy Room ID
    </button>

    <button
      className="w-100"
      style={{
        background: COLORS.danger,
        border: "none",
        borderRadius: "8px",
        padding: "8px",
        color: "#fff",
      }}
      onClick={leaveRoom}
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