import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DoctorNavbar from "../../doctorComponent/DoctorNavbar";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import axios from "axios";

import {
  FaUserCircle,
  FaVideo,
  FaBell,
  FaClock,
  FaArrowLeft,
  FaUserInjured,
} from "react-icons/fa";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

const DoctorVideoCallLobby = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const socket = useSocket();
//   console.log("Socket in lobby:", socket);
  const [appointment, setAppointments] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [session, setSession] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const callPayloadRef = useRef(null);

  const authHeaders = useMemo(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("doctorToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const socketCommunication = useCallback((sessionData) => {
    if (!socket || !sessionData?._id || !sessionData?.roomId) return;
    console.log(sessionData._id, sessionData.roomId);
    //joining room...
    socket.emit("room:join", {
      sessionId: sessionData._id,
      roomId: sessionData.roomId,
    });
  }, [socket]);

  const handleJoinedRoom = useCallback((data) => {
    const roomId = data?.roomId || data?.data?.roomId;
    if (!roomId) {
      setIsJoining(false);
      alert("Error joining room. No room ID provided.");
      return;
    }

    const callPayload =
      callPayloadRef.current || { role: "doctor", session, appointment, doctor, patient };
    
    navigate(`/doctor/video-call/${roomId}`, {
      state: callPayload,
    });
    setIsJoining(false);
  }, [navigate, session, appointment, doctor, patient]);


  useEffect(() => {
    if (!socket) return;

    socket.on("room:joined", handleJoinedRoom);
    return () => {
      socket.off("room:joined", handleJoinedRoom);
    };
  }, [socket, handleJoinedRoom]);

  const handleSession = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_URL}/videos/appointments/${appointmentId}/session/doctor`,
        {},
        { headers: authHeaders }
      );

      if (!response?.data?.success || !response?.data?.data?._id) {
        throw new Error(response?.data?.message || "Unable to create session");
      }
      console.log("Session created:", response.data.data);
      const sessionData = response.data.data;
      const appointmentData = response.data.data.appointment;
      const doctorData = response.data.data.doctor;
      const patientData = response.data.data.patient;

      setSession(sessionData);
      setAppointments(appointmentData);
      setDoctor(doctorData);
      setPatient(patientData);

      callPayloadRef.current = {
        role: "doctor",
        session: sessionData,
        appointment: appointmentData,
        doctor: doctorData,
        patient: patientData,
      };
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Error creating video session"
      );
      navigate("/doctor/appointments");
    }
  }, [appointmentId, authHeaders, navigate]);

  useEffect(() => {
    if (!appointmentId) {
      alert("No appointment found.");
      navigate("/doctor/appointments");
      return;
    }

    if (!socket) {
      alert("Socket connection error.");
      navigate("/doctor/video-calls");
      return;
    }

    handleSession();
  }, [appointmentId, socket, navigate, handleSession]);

  const startCall = () => {
    if (!session?.roomId || !session?._id) {
      alert("Session is not ready yet.");
      return;
    }

    setIsJoining(true);
    callPayloadRef.current = {
      role: "doctor",
      session,
      appointment,
      doctor,
      patient,
    };
    socketCommunication(session);
  };

  const notifyPatient = () => {
    socket.emit("notify-patient", {
      roomId: session?.roomId,
      patientId: patient?._id,
      message: "Doctor is ready for the video consultation",
    });

    alert("Notification sent to patient");
  };

  return (
    <div>
      <DoctorNavbar />

      <div className="p-6 lg:ml-64">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-blue-600"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Lobby Card */}
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

          {/* Patient Info */}
          <div className="flex items-center gap-6 border-b pb-6">

            {patient?.profileImage ? (
              <img
                src={patient.profileImage}
                alt="patient"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-6xl text-gray-400" />
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaUserInjured />
                {patient?.name || "Patient"}
              </h2>

              <p className="text-gray-500 text-sm">{patient?.email}</p>

              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <FaClock />
                {appointment?.date} | {appointment?.startTime} -{" "}
                {appointment?.endTime}
              </p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">

            <div>
              <p className="font-semibold">Doctor</p>
              <p>{doctor?.name}</p>
            </div>

            <div>
              <p className="font-semibold">Specialization</p>
              <p>{doctor?.specialization}</p>
            </div>

            <div>
              <p className="font-semibold">Appointment Type</p>
              <p>{appointment?.type}</p>
            </div>

            <div>
              <p className="font-semibold">Payment</p>
              <p className="text-green-600">{appointment?.paymentStatus}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">

            <button
              onClick={startCall}
              disabled={!session?.roomId || isJoining}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <FaVideo />
              {isJoining ? "Joining..." : "Join Video Call"}
            </button>

            <button
              onClick={notifyPatient}
              className="flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
            >
              <FaBell />
              Notify Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorVideoCallLobby;