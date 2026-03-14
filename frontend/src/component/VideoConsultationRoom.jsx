import React, { useCallback, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
const VideoConsultationRoom = ({role,session, appointment, doctor, patient}) => {
  const socket= useSocket();

  const handleUserJoined=useCallback((sessionId,socketId)=>{
    console.log("User joined session:", sessionId, socketId);
  })

  useEffect(()=>{
    socket.on("user:joined",handleUserJoined);
    return ()=>{
      socket.off("user:joined", handleUserJoined);
    }
  },[socket,handleUserJoined]);
  return (
    <div>
      <h1>Video room</h1>
    </div>
  )
}

export default VideoConsultationRoom





























// import React, { useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   FaMicrophone,
//   FaMicrophoneSlash,
//   FaPhoneSlash,
//   FaVideo,
//   FaVideoSlash,
//   FaExchangeAlt,
//   FaArrowLeft,
//   FaExpand,
// } from "react-icons/fa";

// import { useSocket } from "../contexts/SocketContext";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// const RTC_CONFIGURATION = {
//   iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
// };

// const getToken = () =>
//   localStorage.getItem("token") || localStorage.getItem("doctorToken") || "";

// const VideoConsultationRoom = ({ role,session, appointment, doctor, patient }) => {
//   const navigate = useNavigate();
//   const { sessionId } = useParams();
//   const socket = useSocket();
//   console.log("VideoConsultationRoom received props:", { role, session, appointment, doctor, patient });
//   const [sessionData, setSessionData] = useState(session);

//   const [micEnabled, setMicEnabled] = useState(true);
//   const [cameraEnabled, setCameraEnabled] = useState(true);
//   const [swapLayout, setSwapLayout] = useState(false);

//   const containerRef = useRef(null);

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const localStreamRef = useRef(null);
//   const remoteStreamRef = useRef(null);
//   const peerConnectionRef = useRef(null);

//   const roomIdRef = useRef("");
//   const actorIdRef = useRef("");

//   const authHeaders = useMemo(() => {
//     const token = getToken();
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   }, []);

//   const currentProfile = role === "doctor" ? doctor : patient;

//   const selfName =
//     currentProfile?.name || (role === "doctor" ? "Doctor" : "Patient");

//   const counterpartName =
//     role === "doctor"
//       ? sessionData?.patient?.name || "Patient"
//       : sessionData?.doctor?.name || "Doctor";

//   // ------------------ Peer Connection ------------------

//   const createPeerConnection = () => {
//     const pc = new RTCPeerConnection(RTC_CONFIGURATION);

//     remoteStreamRef.current = new MediaStream();

//     pc.ontrack = (event) => {
//       event.streams[0].getTracks().forEach((track) => {
//         remoteStreamRef.current.addTrack(track);
//       });

//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStreamRef.current;
//       }
//     };

//     pc.onicecandidate = (event) => {
//       if (!event.candidate) return;

//       socket.emit("video_ice_candidate", {
//         roomId: roomIdRef.current,
//         sessionId,
//         candidate: event.candidate,
//       });
//     };

//     peerConnectionRef.current = pc;

//     return pc;
//   };

//   const ensurePC = () =>
//     peerConnectionRef.current || createPeerConnection();

//   // ------------------ API ------------------

//   const fetchSession = async () => {
//     const res = await axios.get(
//       `${API_URL}/videos/sessions/${sessionId}/${role}`,
//       { headers: authHeaders }
//     );

//     return res.data?.data;
//   };

//   const joinSession = async () => {
//     await axios.post(
//       `${API_URL}/videos/sessions/${sessionId}/join/${role}`,
//       {},
//       { headers: authHeaders }
//     );
//   };

//   const leaveSession = async () => {
//     await axios.post(
//       `${API_URL}/videos/sessions/${sessionId}/leave/${role}`,
//       {},
//       { headers: authHeaders }
//     );
//   };

//   // ------------------ Offer ------------------

//   const createOffer = async () => {
//     if (role !== "doctor") return;

//     const pc = ensurePC();

//     if (pc.signalingState !== "stable") return;

//     const offer = await pc.createOffer();

//     await pc.setLocalDescription(offer);

//     socket.emit("video_offer", {
//       roomId: roomIdRef.current,
//       sessionId,
//       offer,
//     });
//   };

//   // ------------------ Init ------------------

//   useEffect(() => {
//     if (!socket) return;

//     const start = async () => {
//       let activeSession =
//         sessionData && sessionData._id === sessionId
//           ? sessionData
//           : await fetchSession();

//       setSessionData(activeSession);

//       roomIdRef.current = activeSession.roomId;

//       actorIdRef.current =
//         role === "doctor"
//           ? activeSession.doctor._id
//           : activeSession.patient._id;

//       // Get camera & mic
//       localStreamRef.current = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = localStreamRef.current;
//       }

//       const pc = createPeerConnection();

//       localStreamRef.current.getTracks().forEach((track) => {
//         pc.addTrack(track, localStreamRef.current);
//       });

//       // -------- Socket Events --------

//       socket.on("video_offer", async ({ offer }) => {
//         const pc = ensurePC();

//         if (pc.signalingState !== "stable") {
//           await pc.setLocalDescription({ type: "rollback" });
//         }

//         await pc.setRemoteDescription(new RTCSessionDescription(offer));

//         const answer = await pc.createAnswer();

//         await pc.setLocalDescription(answer);

//         socket.emit("video_answer", {
//           roomId: roomIdRef.current,
//           sessionId,
//           answer,
//         });
//       });

//       socket.on("video_answer", async ({ answer }) => {
//         const pc = ensurePC();

//         if (!pc.currentRemoteDescription) {
//           await pc.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//       });

//       socket.on("video_ice_candidate", async ({ candidate }) => {
//         const pc = ensurePC();

//         if (candidate) {
//           await pc.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//       });

//       await joinSession();

//       socket.emit("join_video_room", {
//         roomId: activeSession.roomId,
//         sessionId: activeSession._id,
//         participantId: actorIdRef.current,
//         participantType: role,
//       });

//       if (role === "doctor") {
//         createOffer();
//       }
//     };

//     start();

//     return () => {
//       leaveSession();

//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//       }

//       if (localStreamRef.current) {
//         localStreamRef.current.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   // ------------------ Controls ------------------

//   const toggleMicrophone = () => {
//     localStreamRef.current.getAudioTracks().forEach((t) => {
//       t.enabled = !micEnabled;
//     });

//     setMicEnabled(!micEnabled);
//   };

//   const toggleCamera = () => {
//     localStreamRef.current.getVideoTracks().forEach((t) => {
//       t.enabled = !cameraEnabled;
//     });

//     setCameraEnabled(!cameraEnabled);
//   };

//   const endCall = async () => {
//     await leaveSession();
//     navigate(-1);
//   };

//   const goBack = () => {
//     navigate(-1);
//   };

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       containerRef.current.requestFullscreen();
//     } else {
//       document.exitFullscreen();
//     }
//   };

//   // Layout swap

//   const mainVideo = swapLayout ? localVideoRef : remoteVideoRef;
//   const smallVideo = swapLayout ? remoteVideoRef : localVideoRef;

//   const mainName = swapLayout ? selfName : counterpartName;
//   const smallName = swapLayout ? counterpartName : selfName;

//   // ------------------ UI ------------------

//   return (
//     <div ref={containerRef} className="min-h-screen bg-black text-white p-4">
//       <div className="max-w-7xl mx-auto">

//         {/* BACK BUTTON */}

//         <button
//           onClick={goBack}
//           className="mb-3 flex items-center gap-2 text-sm text-gray-300"
//         >
//           <FaArrowLeft /> Back
//         </button>

//         {/* VIDEO AREA */}

//         <div className="relative bg-black rounded-xl overflow-hidden h-[70vh]">

//           {/* MAIN VIDEO */}

//           <video
//             ref={mainVideo}
//             autoPlay
//             playsInline
//             muted={mainVideo === localVideoRef}
//             className="w-full h-full object-cover"
//           />

//           <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded text-sm">
//             {mainName}
//           </div>

//           {/* SMALL VIDEO */}

//           <div className="absolute bottom-4 right-4 w-44 md:w-60 border border-white/20 rounded-lg overflow-hidden">

//             <video
//               ref={smallVideo}
//               autoPlay
//               playsInline
//               muted={smallVideo === localVideoRef}
//               className="w-full h-32 md:h-40 object-cover"
//             />

//             <div className="absolute bottom-1 left-1 text-xs bg-black/70 px-2 rounded">
//               {smallName}
//             </div>

//           </div>

//         </div>

//         {/* CONTROLS */}

//         <div className="flex justify-center gap-4 mt-6 flex-wrap">

//           <button
//             onClick={toggleMicrophone}
//             className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center"
//           >
//             {micEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
//           </button>

//           <button
//             onClick={toggleCamera}
//             className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center"
//           >
//             {cameraEnabled ? <FaVideo /> : <FaVideoSlash />}
//           </button>

//           <button
//             onClick={() => setSwapLayout(!swapLayout)}
//             className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center"
//           >
//             <FaExchangeAlt />
//           </button>

//           <button
//             onClick={toggleFullscreen}
//             className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center"
//           >
//             <FaExpand />
//           </button>

//           <button
//             onClick={endCall}
//             className="px-6 py-3 bg-red-600 rounded-full flex items-center gap-2"
//           >
//             <FaPhoneSlash />
//             End
//           </button>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default VideoConsultationRoom;