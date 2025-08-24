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
      navigate(`/Editor/${roomId}`,{
        state:  {username},
    });
    }
    else {
    // admin user
    navigate(`/Editor/${roomId}/admin`, {
      state: { username },
    });
  }
      
    toast.success("room is created");

    
  }
  return (
    <div className='container-fluid'>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className='col-12 col-md-6'>
          <div className='card shadow-sm p-2 mb-5 bg-secondary rounded'>
            <div className="card-body text-center bg-dark">
              <img src="/images/logo.png"
              alt='Logo'
              className='img-fluid mx-auto d-block'
              style={{maxWidth: "150px"}}
              />
              <h4 className="card-title text-light mb-4">Enter the ROOM ID</h4>
              <div className="form-group">
                <input
                value={roomId}
                onChange={(e)=>setRoomId(e.target.value)}
                  type="text"
                  className="form-control mb-2"
                  placeholder="ROOM ID"
                />
              </div>
              <div className='form-group'>
                <input type='text'
                 value={username}
                onChange={(e)=>setUsername(e.target.value)}
                className='form-control mb-2'
                placeholder='Username'
                />
              </div>
             <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="adminSwitch"
                checked={isAdmin}
                onChange={() => setIsAdmin(!isAdmin)}
              />
              <label className="form-check-label" htmlFor="adminSwitch">
                Join as Admin
              </label>
            </div>
              <button
              onClick={joinRoom}
              className='btn btn-success btn-lg btn-block'
              >Join</button>
               <p className="mt-3 text-light">
                Don't have a room ID? 
                <span
                  className=" text-success p-2"
                  style={{ cursor: "pointer" }}
                  onClick={generateRoomid}
                >
                  
                  New Room
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;
