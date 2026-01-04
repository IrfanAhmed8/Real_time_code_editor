import React, { useState } from 'react';
import {v4 as uuid} from "uuid";
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId,setRoomId]=useState("");
  const [username,setUsername]=useState("");
  const [isAdmin,setIsAdmin]=useState(false);
  const navigate = useNavigate();
  const inputStyle = {
  backgroundColor: "#0f1624",
  border: "1px solid #1f2937",
  borderRadius: "10px",
  padding: "0.75rem 1rem",
  color: "#e5e7eb",
};

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
    className="d-flex align-items-center justify-content-center min-vh-100"
    style={{
      background:
        "radial-gradient(1200px circle at top, #111827 0%, #0b0f14 60%)",
    }}
  >
    <div
      className="shadow-lg text-center"
      style={{
        width: "100%",
        maxWidth: "420px",
        background: "linear-gradient(180deg, #111827, #0b1220)",
        borderRadius: "18px",
        padding: "3rem 2.5rem",
        border: "1px solid #1f2937",
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 1.5rem",
          borderRadius: "14px",
          background: "rgba(34,197,94,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{ width: "36px" }}
        />
      </div>

      {/* Title */}
      <h3 className="fw-semibold text-light mb-2">
        Join a Coding Room
      </h3>
      <p className="text-secondary small mb-4">
        Real-time collaboration for focused developers.
      </p>

      {/* Room ID */}
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room ID"
        className="form-control mb-3"
        style={inputStyle}
      />

      {/* Username */}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="form-control mb-4"
        style={inputStyle}
      />

      {/* CTA */}
      <button
        onClick={joinRoom}
        className="w-100 fw-semibold"
        style={{
          padding: "0.85rem",
          borderRadius: "10px",
          background: "#22c55e",
          border: "none",
          color: "#052e16",
          boxShadow: "0 6px 20px rgba(34,197,94,0.25)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-1px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0)")
        }
      >
        Join Room →
      </button>

      {/* Create */}
      <p className="mt-4 text-secondary small">
        Don’t have a room?{" "}
        <span
          onClick={generateRoomid}
          style={{
            color: "#22c55e",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Create one
        </span>
      </p>
    </div>
  </div>
);



}

export default Home;
