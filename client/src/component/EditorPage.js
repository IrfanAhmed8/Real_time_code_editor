
import Editor from "./Editor"
import Client from "./Client"
import { toast } from 'react-hot-toast';
import React, { useEffect, useRef, useState } from "react";
import { initSocket } from "../socket";
import { useNavigate,useLocation,Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import "./Editor.css"
function EditorPage() {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const codeRef =useRef(null);
  const [clients, setClients] = useState([]);
  
  useEffect(() => {
    const handleError = (err) => {
      console.error("socket_error =>", err);
      toast.error("Socket connection failed");
      navigate("/");
    };

    const init = async () => {
      socketRef.current = await initSocket();

      // error handling
      socketRef.current.on("connect_error", handleError);
      socketRef.current.on("connect_failed", handleError);

      // join room
      //emit sends data to the backend
      socketRef.current.emit("join", {
        roomId,
        username: location.state?.username,
      });

      // when someone joins
      //data comes from the backend(socket.on).
      socketRef.current.on("joined", ({ Clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined`);
        }
        setClients(Clients);
        socketRef.current.emit('sync-code',{
           code:codeRef.current,
          socketId,
        });
      });

      // when someone leaves
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

  return (
    <div className="container-fluid vh-100 d-flex flex-column" >
      <div className="row flex-grow-1">
        <div className="col-md-2 bg-dark text-light d-flex flex-column">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="img-fluid mx-auto"
            style={{ maxWidth: "150px", marginTop: "0px" }}
          />
          <hr style={{ marginTop: "2rem" }} />

          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-2" marginTop="50px">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button onClick={copyRoomId} className="btn btn-success w-100 mb-2">
              Copy Room ID
            </button>
            <button  onClick={leaveRoom} className="btn btn-danger w-100">
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column">
          <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{
            codeRef.current=(code)
          }} />
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
