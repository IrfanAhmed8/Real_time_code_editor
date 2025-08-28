
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
    };

    init();

    return () => {
      if (socketRef.current) {
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
  const runCode = async () => {
    console.log("Run button clicked");
    try {
      const res = await axios.post("http://localhost:5000/run", {
        language,
        code,
      });
      setOutput(res.data.output);
    } catch (err) {
      console.error("Error calling backend:", err);
      setOutput("Error running code");
    }
    setOutputVisible(true);
  };
return(
<div className="container-fluid vh-100 d-flex flex-column bg-dark">
  <div className="row flex-grow-1">

    {/* Sidebar */}
    <div className="col-md-2 bg-dark text-light d-flex flex-column border-end">
      {/* Logo */}
      <img
        src="/images/logo.png"
        alt="Logo"
        className="img-fluid mx-auto my-3"
        style={{ maxWidth: "120px" }}
      />
      <hr className="border-secondary" />

      {/* Client list */}
      <div className="d-flex flex-column flex-grow-1 overflow-auto px-2">
        <span className="fw-semibold d-block mb-2">Members</span>
        {clients.map((client) => (
          <Client key={client.socketId} username={client.username} />
        ))}
      </div>

      <hr className="border-secondary" />

      {/* Buttons */}
      <div className="mt-auto mb-3 px-2">
        <button onClick={copyRoomId} className="btn btn-outline-light w-100 mb-2">
          Copy Room ID
        </button>
        <button onClick={leaveRoom} className="btn btn-danger w-100">
          Leave Room
        </button>
      </div>
    </div>

    {/* Main panel */}
    <div className="col-md-10 text-light d-flex flex-column p-0">
      {/* TopBar */}
      <TopBar
        language={language}
        setLanguage={setLanguage}
        runCode={runCode}
      />

      {/* Editor Area */}
      <div className="d-flex flex-row flex-grow-1">
        <div className="d-flex flex-column flex-fill border-start" style={{ minWidth: 0 }}>
          <Editor
            socketRef={socketRef}
            roomId={`${roomId}`}
            onCodeChange={setCode}
            output={output}
            outputVisible={outputVisible}
          />
        </div>
      </div>
    </div>
  </div>
</div>
)
}

export default EditorPage;
