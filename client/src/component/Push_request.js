import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Push_request() {
  const { roomId } = useParams(); // URL param
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchPushes = async () => {
      try {
        // Call your Express backend
        const res = await fetch(`http://localhost:8000/api/pushRequest/${roomId}`);
        const data = await res.json();
        console.log("Fetched pushes:", data); // 👀 Debugging
        setRequests(data);
      } catch (err) {
        console.error("Error fetching pushes:", err);
      }
    };

    fetchPushes();
  }, [roomId]);

  return (
    <div className="container p-4">
      <h2>Push Requests for Room: {roomId}</h2>
      {requests.length === 0 ? (
        <p>No pushes yet</p>
      ) : (
        <ul>
          {requests.map((req, index) => (
            <li key={index}>
              <strong>{req.username}</strong>: {req.code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Push_request;
