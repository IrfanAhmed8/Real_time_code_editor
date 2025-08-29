import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { initSocket } from "../socket";
import toast from "react-hot-toast";
import axios from "axios";

function Push_request() {
  const { roomId } = useParams();
  const [pushCodes, setPushCodes] = useState([]);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleError = (err) => {
      console.error("socket_error =>", err);
      toast.error("Socket connection failed");
      navigate("/");
    };

    const init = async () => {
      // 1️⃣ fetch existing pushes from DB
      try {
        const res = await axios.get(`http://localhost:5000/api/pushRequest/${roomId}`);
        setPushCodes(res.data); // preload from DB
      } catch (err) {
        console.error("Error fetching push requests:", err);
      }

      // 2️⃣ connect socket
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleError);
      socketRef.current.on("connect_failed", handleError);

      // 3️⃣ listen for updates from server
      socketRef.current.on("get-push-request", (codes) => {
        setPushCodes(codes);
      });

      // optionally join the room so you only get relevant updates
      socketRef.current.emit("join", roomId);
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, navigate]);

  return (
    <div>
      <h2>Push Requests in Room {roomId}</h2>
      <ul>
        {pushCodes.map((item, idx) => (
          <li key={idx}>
            <strong>{item.username}:</strong>
            <pre>{item.code}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Push_request;
