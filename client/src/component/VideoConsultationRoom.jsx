import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import peer from "../services/peer";
import "./VideoConsultationRoom.css";
import VideoNavbar from "./VideoNavbar";
import { VideoFunctionality } from "./VideoFunctionality";
const VideoConsultationRoom = ({ role, session }) => {
  console.log(session);
  const socket = useSocket();
  const navigate = useNavigate();
  const getParticipantName = (participant, fallback) => {
    if (!participant) return fallback;
    return (
      participant.name ||
      participant.fullName ||
      participant.firstName ||
      participant.username ||
      fallback
    );
  };

  const doctorName = getParticipantName(session?.doctor, "Doctor");
  const patientName = getParticipantName(session?.patient, "Patient");
  const myName = role === "doctor" ? doctorName : patientName;
  const remoteName = role === "doctor" ? patientName : doctorName;

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const handleCallUser = useCallback(async (targetSocketId) => {
    try {
      const targetId = targetSocketId || remoteSocketId;
      if (!targetId) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setMyStream(stream);
      localStreamRef.current = stream;

      // add tracks first
      stream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, stream);
      });

      const offer = await peer.getOffer();

      socket.emit("user:call", {
        to: targetId,
        offer,
      });

    } catch (err) {
      console.error(err);
    }
  }, [remoteSocketId, socket]);

  const handleUserJoined = useCallback(({ socketId }) => {
    console.log("User joined:", socketId);
    setRemoteSocketId(socketId);

    if (role === "doctor") {
      // Doctor initiates offer as soon as patient joins the room.
      setTimeout(() => {
        handleCallUser(socketId);
      }, 0);
    }
  }, [role, handleCallUser]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setMyStream(stream);
      localStreamRef.current = stream;

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

  // negotiation
  const handleNegoNeeded = useCallback(async () => {
    if (!remoteSocketId) return;

    const offer = await peer.getOffer();

    socket.emit("peer:nego:needed", {
      to: remoteSocketId,
      offer,
    });
  }, [remoteSocketId, socket]);

  const handleNegoIncoming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit("peer:nego:done", { to: from, ans });
  },[socket]);

  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handleICECandidate = useCallback(({ candidate }) => {
    if (!candidate) return;
    peer.peer.addIceCandidate(candidate).catch((err) => {
      console.error("Error adding remote ICE candidate", err);
    });
  }, []);

  const handleEndCall = useCallback(() => {
  // tell other user call ended
  if (remoteSocketId) {
    socket.emit("call:end", { to: remoteSocketId });
  }

  // stop local stream
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }

  // stop remote stream also
  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop());
  }

  // clear video tags
  if (myVideoRef.current) myVideoRef.current.srcObject = null;
  if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

  // reset states
  setMyStream(null);
  setRemoteStream(null);
  setRemoteSocketId(null);

  // close peer connection
  peer.peer.getSenders().forEach((sender) => {
    try {
      peer.peer.removeTrack(sender);
    } catch (err) {
      console.error("Error removing sender", err);
    }
  });

  peer.peer.close();

  // recreate peer connection if your peer service supports it
  peer.createPeer();

  // navigate to video calls page
  const navigationPath = `/${role}/video-calls`;
  console.log("Navigating to:", navigationPath);
  navigate(navigationPath);
}, [remoteSocketId, socket, remoteStream, role, navigate]);

const handleCallEnded = useCallback(() => {
  console.log("handleCallEnded triggered with role:", role);
  
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop());
  }

  if (myVideoRef.current) myVideoRef.current.srcObject = null;
  if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

  setMyStream(null);
  setRemoteStream(null);
  setRemoteSocketId(null);

  peer.peer.close();
  peer.createPeer();
  
  const navigationPath = `/${role}/video-calls`;
  console.log("Navigating to:", navigationPath);
  navigate(navigationPath);
}, [remoteStream, navigate, role]);
    // socket listeners
useEffect(() => {
  socket.on("user:joined", handleUserJoined);
  socket.on("incoming:call", handleIncomingCall);
  socket.on("call:accepted", handleCallAccepted);
  socket.on("peer:nego:needed", handleNegoIncoming);
  socket.on("peer:nego:final", handleNegoFinal);
  socket.on("peer:ice:candidate", handleICECandidate);
  socket.on("call:ended", () => {
    console.log("call:ended event received");
    handleCallEnded();
  });

  return () => {
    socket.off("user:joined", handleUserJoined);
    socket.off("incoming:call", handleIncomingCall);
    socket.off("call:accepted", handleCallAccepted);
    socket.off("peer:nego:needed", handleNegoIncoming);
    socket.off("peer:nego:final", handleNegoFinal);
    socket.off("peer:ice:candidate", handleICECandidate);
    socket.off("call:ended", handleCallEnded);
  };
}, [
  socket,
  handleUserJoined,
  handleIncomingCall,
  handleCallAccepted,
  handleNegoIncoming,
  handleNegoFinal,
  handleICECandidate,
  handleCallEnded,
]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);
  

  useEffect(() => {
    const handleIceCandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("peer:ice:candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    peer.peer.addEventListener("icecandidate", handleIceCandidate);

    return () => {
      peer.peer.removeEventListener("icecandidate", handleIceCandidate);
    };
  }, [socket, remoteSocketId]);

  // receive remote stream
  useEffect(() => {
    const handleTrack = (ev) => {
      const [stream] = ev.streams;
      setRemoteStream(stream);
    };

    peer.peer.addEventListener("track", handleTrack);

    return () => {
      peer.peer.removeEventListener("track", handleTrack);
    };
  }, []);


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

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      
      <VideoNavbar role={role} doctor={session.doctor} patient={session.patient} connected={!!remoteSocketId} />
      <div className="video-consulation-container">

        {myStream && (
          <div className="myvideo-wrapper">
            <h2>{myName}</h2>
            <video className="myvideo"
              ref={myVideoRef}
              autoPlay
              muted
              playsInline
            />
          </div>
        )}

        {remoteStream && (
          <div className="remotevideo-wrapper">
            <h2>{remoteName}</h2>
            <video className="remotevideo"
              ref={remoteVideoRef}
              autoPlay
              playsInline
            />
          </div>
        )}
      </div>
      <VideoFunctionality role={role} onEndCall={handleEndCall} />
    </div>
  );
};

export default VideoConsultationRoom;