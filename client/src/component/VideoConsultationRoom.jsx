import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import peer from "../services/peer";
import "./VideoConsultationRoom.css";
import VideoNavbar from "./VideoNavbar";
import { VideoFunctionality } from "./VideoFunctionality";
import axios from "axios";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

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

  const getDoctorAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("doctorToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const endVideoSession = useCallback(async () => {
    const sessionId = session?._id;

    if (!sessionId) {
      console.warn("No session id found; skipping session end update");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") ||
        (role === "doctor"
          ? localStorage.getItem("doctorToken")
          : localStorage.getItem("patientToken"));

      if (!token) {
        console.warn("No auth token found; skipping video session end update");
        return;
      }
      
      const endpoint = role === "doctor"
        ? `${API_URL}/videos/sessions/${sessionId}/leave/doctor`
        : `${API_URL}/videos/sessions/${sessionId}/leave/patient`;

      console.log(`${role} ending video session and calculating duration...`);
      await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error(
        "Failed to end video session:",
        err?.response?.data?.message || err?.message || err
      );
    }
  }, [role, session]);

  const markAppointmentCompletedIfDoctor = useCallback(async () => {
    const appointmentId =
      session?.appointment?._id || session?.appointmentId || session?.appointment;

    if (!appointmentId) {
      console.warn("No appointment id found in session; skipping completion update");
      return;
    }

    try {
      console.log("Marking appointment as completed in backend...");
      await axios.post(
        `${API_URL}/appointments/${appointmentId}/doctor-complete`,
        {},
        { headers: getDoctorAuthHeaders() }
      );
    } catch (err) {
      console.error(
        "Failed to mark appointment as completed:",
        err?.response?.data?.message || err?.message || err
      );
    }
  }, [session, getDoctorAuthHeaders]);

  const attachLocalTracks = useCallback((stream) => {
    stream.getTracks().forEach((track) => {
      const existingSender = peer.peer
        .getSenders()
        .find((sender) => sender?.track?.kind === track.kind);

      if (existingSender) {
        existingSender.replaceTrack(track);
      } else {
        peer.peer.addTrack(track, stream);
      }
    });
  }, []);

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

      // Keep the same add-track -> create-offer sequence as the working room flow.
      attachLocalTracks(stream);

      const offer = await peer.getOffer();

      socket.emit("user:call", {
        to: targetId,
        offer,
      });

    } catch (err) {
      console.error(err);
    }
  }, [remoteSocketId, socket, attachLocalTracks]);

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

      attachLocalTracks(stream);

      const ans = await peer.getAnswer(offer);

      socket.emit("call:answer", {
        to: from,
        ans,
      });
    },
    [socket, attachLocalTracks]
  );

  const handleCallAccepted = useCallback(({ ans }) => {
    peer.setLocalDescription(ans);
  }, []);

  // negotiation
  const handleNegoNeeded = useCallback(async () => {
    if (!remoteSocketId) return;
    if (peer.peer.signalingState !== "stable") return;

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
    peer.addIceCandidateSafely(candidate).catch((err) => {
      console.error("Error adding remote ICE candidate", err);
    });
  }, []);

  const handleEndCall = useCallback(async () => {
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

  // End video session first to record duration, then mark appointment completed
  await endVideoSession();
  await markAppointmentCompletedIfDoctor();

  // navigate to video calls page
  const navigationPath = `/${role}/video-calls`;
  navigate(navigationPath);
}, [remoteSocketId, socket, remoteStream, role, navigate, endVideoSession, markAppointmentCompletedIfDoctor]);

const handleCallEnded = useCallback(async () => {
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

  // End video session to record duration
  await endVideoSession();

  const navigationPath = `/${role}/video-calls`;
  console.log("Navigating to:", navigationPath);
  navigate(navigationPath);
}, [remoteStream, navigate, role, endVideoSession]);

const handleCallEndedEvent = useCallback(() => {
  console.log("call:ended event received");
  handleCallEnded();
}, [handleCallEnded]);

    // socket listeners
useEffect(() => {
  socket.on("user:joined", handleUserJoined);
  socket.on("incoming:call", handleIncomingCall);
  socket.on("call:accepted", handleCallAccepted);
  socket.on("peer:nego:needed", handleNegoIncoming);
  socket.on("peer:nego:final", handleNegoFinal);
  socket.on("peer:ice:candidate", handleICECandidate);
  socket.on("call:ended", handleCallEndedEvent);

  return () => {
    socket.off("user:joined", handleUserJoined);
    socket.off("incoming:call", handleIncomingCall);
    socket.off("call:accepted", handleCallAccepted);
    socket.off("peer:nego:needed", handleNegoIncoming);
    socket.off("peer:nego:final", handleNegoFinal);
    socket.off("peer:ice:candidate", handleICECandidate);
    socket.off("call:ended", handleCallEndedEvent);
  };
}, [
  socket,
  handleUserJoined,
  handleIncomingCall,
  handleCallAccepted,
  handleNegoIncoming,
  handleNegoFinal,
  handleICECandidate,
  handleCallEndedEvent,
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