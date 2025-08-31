import React, { useState } from 'react';
import {v4 as uuid} from "uuid";
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId,setRoomId]=useState("");
  const [username,setUsername]=useState("");
  const [isAdmin,setIsAdmin]=useState(false);
  const navigate = useNavigate();
  const generateRoomid =(e)=>{
    e.preventDefault();
    const id=uuid();
    setRoomId(id);
    toast.success("room id is generated")
  }
  const joinRoom=(e)=>{
    if(!roomId || ! username){
      toast.error("please fill both input box")
      return;
    }
    if(!isAdmin){
      navigate(`/EditorPage/${roomId}`,{
        state:  {username},
    });
    }
    else {
    // admin user
    navigate(`/EditorWithAdmin/${roomId}`, {
      state: { username },
    });
  }
      
    toast.success("room is created");

    
  }
  return (
  <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-light">
    <div className="card shadow-lg border-0 p-4 rounded-4" style={{ background: "linear-gradient(145deg, #1f1f1f, #2a2a2a)" }}>
      <div className="card-body text-center">
        
        {/* Logo */}
        <img
          src="/images/logo.png"
          alt="Logo"
          className="img-fluid mx-auto d-block mb-3"
          style={{ maxWidth: "120px", filter: "drop-shadow(0px 0px 6px #00ff88)" }}
        />

        {/* Title */}
        <h3 className="fw-bold text-success mb-4">Join a Coding Room</h3>

        {/* Room ID */}
        <div className="form-group mb-3">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            type="text"
            className="form-control form-control-lg bg-dark text-light border-0 shadow-sm"
            style={{ borderRadius: "12px", boxShadow: "inset 0 0 10px #111" }}
            placeholder="🔑 Enter Room ID"
          />
        </div>

        {/* Username */}
        <div className="form-group mb-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control form-control-lg bg-dark text-light border-0 shadow-sm"
            style={{ borderRadius: "12px", boxShadow: "inset 0 0 10px #111" }}
            placeholder="👨‍💻 Enter Username"
          />
        </div>

        {/* Admin Switch */}
        <div className="form-check form-switch d-flex align-items-center justify-content-center mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="adminSwitch"
            checked={isAdmin}
            onChange={() => setIsAdmin(!isAdmin)}
          />
          <label className="form-check-label ms-2" htmlFor="adminSwitch">
            Join as Admin
          </label>
        </div>

        {/* Join Button */}
        <button
          onClick={joinRoom}
          className="btn btn-success btn-lg w-100 fw-bold"
          style={{ borderRadius: "12px", boxShadow: "0 0 15px rgba(0, 255, 136, 0.6)" }}
        >
          🚀 Join Room
        </button>

        {/* New Room */}
        <p className="mt-4">
          Don’t have a room?{" "}
          <span
            className="text-info fw-bold"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={generateRoomid}
          >
            Create New Room
          </span>
        </p>
      </div>
    </div>
  </div>
);

}

export default Home;
