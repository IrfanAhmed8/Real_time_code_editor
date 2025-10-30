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
  <div
    className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-light"
    style={{
      background: "radial-gradient(circle at top, #10141a 0%, #0b0f13 100%)",
    }}
  >
    <div
      className="card border-0 shadow-lg p-5 text-center"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "400px",
      }}
    >
      {/* Logo */}
      <img
        src="/images/logo.png"
        alt="Logo"
        className="img-fluid mx-auto d-block mb-3"
        style={{
          maxWidth: "80px",
          filter: "drop-shadow(0 0 6px #00ff88aa)",
        }}
      />

      {/* Title */}
      <h3 className="fw-bold text-light mb-2">Join a Coding Room</h3>
      <p className="text-secondary small mb-4">
        Collaborate, code, and create in real time.
      </p>

      {/* Room ID */}
      <div className="form-group mb-3">
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          type="text"
          className="form-control text-light border-0 py-3"
          style={{
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            transition: "all 0.2s ease",
          }}
          placeholder="🔑 Room ID"
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 2px #00ff8899 inset")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />
      </div>

      {/* Username */}
      <div className="form-group mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-control text-light border-0 py-3"
          style={{
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            transition: "all 0.2s ease",
          }}
          placeholder="👨‍💻 Username"
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 2px #00ff8899 inset")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />
      </div>

     
      

      {/* Join Button */}
      <button
        onClick={joinRoom}
        className="btn w-100 py-3 fw-semibold"
        style={{
          borderRadius: "10px",
          background:
            "linear-gradient(90deg, #00ff88 0%, #00b86b 100%)",
          border: "none",
          color: "#0b0f13",
          boxShadow: "0 0 12px #00ff8855",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 0 16px #00ff88aa";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 0 12px #00ff8855";
        }}
      >
        🚀 Join Room
      </button>

      {/* Create New Room */}
      <p className="mt-4 mb-0 text-secondary small">
        Don’t have a room?{" "}
        <span
          className="text-success fw-semibold"
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            transition: "color 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.color = "#00ff88")}
          onMouseOut={(e) => (e.target.style.color = "")}
          onClick={generateRoomid}
        >
          Create one
        </span>
      </p>
    </div>
  </div>
);


}

export default Home;
