import React, { useState,useRef,useEffect, use } from 'react'
import CodeMirror from "codemirror"; // import main library
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import { initSocket } from "../socket";
import Client from './Client';

import { useNavigate,useLocation,Navigate,useParams } from "react-router-dom";
// Import addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";


// Import modes
import "codemirror/mode/javascript/javascript";
import toast from 'react-hot-toast';
function EditorWithAdmin() {
  const [language,setLanguage]=useState("python")
    const textareaRef = useRef(null);
    const {roomId}=useParams()
    const socketRef=useRef(null);
    const navigate=useNavigate();
    const location = useLocation();
    const[clients,setClients]=useState([]);
    //editorref is used to detect change on the ediotr
    const editorRef = useRef(null);
    useEffect(()=>{
      const handleError = (err) => {
      console.error("socket_error =>", err);
      toast.error("Socket connection failed");
      navigate("/");
      }

         const init=async ()=>{
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleError);
      socketRef.current.on("connect_failed", handleError);

      socketRef.current.emit("join",{
        roomId,
        username: location.state?.username,
      })
      socketRef.current.on("joined",({clients,username,socketid})=>{
        if(username!==location.state?.username){
          toast.success(`${username} joined`)
        }
        setClients(clients);
      })
      socketRef.current.on("disconnected", ({ socketId, username }) => {
        toast.success(`${username} left`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    
     
     
    }
    init();
    return ()=>{
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
      }
     }
    },[navigate, location.state, roomId])
   
   
    useEffect(() => {
    
    if (textareaRef.current) {
      const editor = CodeMirror.fromTextArea(textareaRef.current, {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
       
      });
    }
  })
  const leaveRoom = async () => {
    navigate("/");
  };
  return (
  <div className="bg-dark text-light vh-100 d-flex flex-column">

    {/* Top Bar */}
    <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom" style={{ background: "#1e1e1e" }}>
      {/* Logo / Title */}
      <span className="fw-bold fs-4 text-info">CODE-MATE</span>

      {/* Controls */}
      <div className="d-flex align-items-center gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="form-select form-select-sm"
          style={{ background: "#2c2c2c", color: "white", border: "1px solid #555" }}
        >
          <option value="python">Python</option>
          <option value="javascript">Javascript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <button className="btn btn-warning btn-sm">
          Push Request
        </button>
        <button className="btn btn-success btn-sm">
          Run ▶
        </button>
        <button className="btn btn-primary btn-sm">
          Push
        </button>
      </div>
    </div>

    {/* Main Layout */}
    <div className="container-fluid flex-grow-1 d-flex p-0">
      
      {/* Sidebar */}
      <div className="col-md-2 bg-dark text-light d-flex flex-column border-end">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="img-fluid mx-auto my-3"
          style={{ maxWidth: "120px" }}
        />
        <hr className="border-secondary" />

        <div className="flex-grow-1 overflow-auto px-2">
          <span className="fw-semibold d-block mb-2">Members</span>
          {clients.map((client) => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>

        <hr className="border-secondary" />
        <div className="mt-auto mb-3 px-2">
          <button className="btn btn-outline-light w-100 mb-2">
            Copy Room ID
          </button>
          <button onClick={leaveRoom} className="btn btn-danger w-100">
            Leave Room
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="col-md-6 d-flex flex-column p-2">
        <textarea ref={textareaRef} className="flex-grow-1 w-100 border-0 p-2" style={{ background: "#1e1e1e", color: "white" }} />
      </div>

      {/* Diff Column */}
      <div className="col-md-4 d-flex flex-column border-start">
        <div
          className="diff-viewer flex-grow-1"
          style={{
            background: "#f8f9fa",
            padding: "10px",
            overflow: "auto",
          }}
        >
          Diff Column
        </div>
      </div>
    </div>
  </div>
);

}

export default EditorWithAdmin