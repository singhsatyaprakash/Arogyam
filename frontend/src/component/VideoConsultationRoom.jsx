import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import peer from "../services/peer";

const VideoConsultationRoom = ({ role }) => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const handleUserJoined = useCallback(({ sessionId, socketId }) => {
    console.log("User joined:", socketId);
    setRemoteSocketId(socketId);
  }, []);

  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setMyStream(stream);

      // add tracks first
      stream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, stream);
      });

      const offer = await peer.getOffer();

      socket.emit("user:call", {
        to: remoteSocketId,
        offer,
      });

    } catch (err) {
      console.error(err);
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setMyStream(stream);

      stream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, stream);
      });

      const ans = await peer.getAnswer(offer);

      socket.emit("call:answer", {
        to: from,
        ans,
      });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(({ ans }) => {
    peer.setLocalDescription(ans);
  }, []);

  // auto call
  useEffect(() => {
    if (remoteSocketId && role === "doctor") {
      handleCallUser();
    }
  }, [remoteSocketId, handleCallUser, role]);

  // negotiation
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();

    socket.emit("peer:nego:needed", {
      to: remoteSocketId,
      offer,
    });
  }, [remoteSocketId, socket]);

  const handleNegoIncoming=useCallback(async({from, offer})=>{
    const ans=peer.getAnswer(offer);
    socket.emit('peer:nego:done',{to:from,ans});    
  },[socket]);
  
  const handleNegoFinal=useCallback(async({ans})=>{
    await peer.setLocalDescription(ans);
  },[socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  // receive remote stream
  useEffect(() => {
    peer.peer.addEventListener("track", (ev) => {
      const [stream] = ev.streams;
      setRemoteStream(stream);
    });
  }, []);

  // socket listeners
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed",handleNegoIncoming);
    socket.on("peer:nego:final",handleNegoFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final",handleNegoFinal);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted,handleNegoIncoming,handleNegoFinal]);

  // attach local stream
  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  // attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div>
      <h1>Video Room</h1>

      <h4>
        {remoteSocketId
          ? "Connected"
          : `Waiting for ${role === "doctor" ? "patient" : "doctor"}`}
      </h4>

      {myStream && (
        <>
          <h2>{role === "doctor" ? "Doctor View" : "Patient View"}</h2>

          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            width="300"
            height="200"
          />
        </>
      )}

      {remoteStream && (
        <>
          <h2>{role === "doctor" ? "Patient View" : "Doctor View"}</h2>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            width="300"
            height="200"
          />
        </>
      )}
    </div>
  );
};

export default VideoConsultationRoom;