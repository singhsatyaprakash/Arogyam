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

  // socket listeners
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed",handleNegoIncoming);
    socket.on("peer:nego:final",handleNegoFinal);
    socket.on("peer:ice:candidate", handleICECandidate);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final",handleNegoFinal);
      socket.off("peer:ice:candidate", handleICECandidate);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted,handleNegoIncoming,handleNegoFinal, handleICECandidate]);

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