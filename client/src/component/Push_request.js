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
      try {
        // 1️⃣ Fetch existing pushes from DB
        const res = await axios.get(
          `http://localhost:5000/api/pushRequest/${roomId}`
        );
        setPushCodes(res.data);
      } catch (err) {
        console.error("Error fetching push requests:", err);
      }

    
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", handleError);
      socketRef.current.on("connect_failed", handleError);

      // Listen for updates
      socketRef.current.on("get-push-request", (codes) => {
        setPushCodes(codes);
      });

      socketRef.current.emit("join", roomId);
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, navigate]);

  const handleAccept = (id) => {
    toast.success(`Accepted push request ${id}`);
    // later you can emit socket or API call
  };

  const handleReject = (id) => {
    toast.error(`Rejected push request ${id}`);
    // later you can emit socket or API call
  };
  const addToDiff=(item)=>{
    socketRef.current.emit("addToDiff",{
      code:item.code,
      roomId    
    })
  }

  return (
    <div className="flex h-screen">
      {/* Left Side - Push Requests */}
      <div className="w-1/2 p-4 bg-gray-50 border-r border-gray-300 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Push Requests in Room {roomId}
        </h2>
        <div className="space-y-4">
          {pushCodes.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-white shadow-md rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-600">
                  {item.username}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={()=>addToDiff(item)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(item._id || idx)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                {item.code}
              </pre>
            </div>
          ))}
          {pushCodes.length === 0 && (
            <p className="text-gray-500 italic">No push requests yet.</p>
          )}
        </div>
      </div>

      
      <div className="w-1/2 p-4 flex items-center justify-center text-gray-400">
        <p>👨‍💻 Code Viewer will appear here...</p>
      </div>
    </div>
  );
}

export default Push_request;
