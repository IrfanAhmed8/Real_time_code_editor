import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

let socket; // maintain single connection

function Push_request() {
  const { roomId } = useParams();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // connect socket (if not already)
    if (!socket) {
      socket = io("http://localhost:5000"); // your backend url
    }

    // listen for push-request event
    socket.on("push-request", ({ username, code }) => {
      setRequests((prev) => [...prev, { username, code }]);
    });

    // cleanup
    return () => {
      socket.off("push-request");
    };
  }, []);

  return (
    <div className="container p-4">
      <h2>Push Requests for Room: {roomId}</h2>
      {requests.length === 0 ? (
        <p>No push requests yet...</p>
      ) : (
        requests.map((req, i) => (
          <div key={i} className="card p-3 my-2 shadow-sm">
            <h5>{req.username}</h5>
            <pre style={{ whiteSpace: "pre-wrap" }}>{req.code}</pre>
          </div>
        ))
      )}
    </div>
  );
}

export default Push_request;
