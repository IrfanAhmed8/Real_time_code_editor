
import EditorPage from "./EditorPage"
import Client from "./Client"
import { toast } from 'react-hot-toast';
import React, { useEffect, useRef, useState } from "react";
import { initSocket } from "../socket";
import { useNavigate,useLocation,Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
function Editor() {
  const socketRef=useRef('NULL');
  const location=useLocation();
  const {roomId}=useParams();
  const navigate=useNavigate();
  useEffect(() =>{
    const init=async () =>{
      socketRef.current= await initSocket();
      socketRef.current.on("connect_error" ,(err)=> handleError(err))
      socketRef.current.on("connect_failed" ,(err)=> handleError(err))


      const handleError=(e) =>{
        console.log('socket_error=>',e)
        toast.error("Socket connection failed");
        navigate('/');
      }
      socketRef.current.emit('join',
        {roomId,
          username:location.state?.username
        }); 
      socketRef.current.on('joined',({Clients,username,socketId})=>{
          if(username!== location.state?.username){
            toast.success(`${username} joined`)
          }
          setClients(Clients)
        })
        socketRef.current.on("disconnected",({socketId,username})=>{
          toast.success(`${username} left`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        })
    }
    init();
    socketRef.current.disconnect();
    socketRef.current.off("joined");
    socketRef.current('disconnect');
  },[]);
  const [clients, setClients] = useState([
  
]);

  if(!location.state){
    return<Navigate to="/" />;
  }
  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className="col-md-2 bg-dark text-light d-flex flex-column">
          <img
            src="/images/codecast.png"
            alt="Logo"
            className="img-fluid mx-auto"
            style={{ maxWidth: "150px", marginTop: "-43px" }}
          />
          <hr style={{ marginTop: "-3rem" }} />

          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-2">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button className="btn btn-success w-100 mb-2" >
              Copy Room ID
            </button>
            <button className="btn btn-danger w-100" >
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column">
          {/* Language selector */}
          

          <EditorPage />
        </div>
      </div>
    </div>
  );
}

export default Editor