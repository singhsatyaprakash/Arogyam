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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-orange-50/40">
      <DoctorNavbar />

      <main className="relative px-4 sm:px-6 py-6 lg:ml-64">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 sm:left-6 top-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Lobby Card */}
        <div className="pt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden">

          <div className="border-b border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50 p-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Video Call Lobby</h1>
            <p className="mt-1 text-sm text-gray-600">Verify patient details and start the consultation when ready.</p>
          </div>

          <div className="p-5 sm:p-6">

          {/* Patient Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

            {patient?.profileImage ? (
              <img
                src={patient.profileImage}
                alt="patient"
                className="w-20 h-20 rounded-full object-cover border border-rose-200"
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

              <p className="text-gray-600 flex items-center gap-2 mt-2 text-sm">
                <FaClock />
                {appointment?.date} | {appointment?.startTime} -{" "}
                {appointment?.endTime}
              </p>
            </div>
          </div>
          </div>

          {/* Appointment Details */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Doctor</p>
              <p className="text-gray-900 mt-0.5">{doctor?.name || "N/A"}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Specialization</p>
              <p className="text-gray-900 mt-0.5">{doctor?.specialization || "N/A"}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Appointment Type</p>
              <p className="text-gray-900 mt-0.5 capitalize">{appointment?.type || "N/A"}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Payment</p>
              <p className="text-green-600 font-medium mt-0.5 capitalize">{appointment?.paymentStatus || "N/A"}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">

            <button
              onClick={startCall}
              disabled={!session?.roomId || isJoining}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaVideo />
              {isJoining ? "Joining..." : "Join Video Call"}
            </button>

            <button
              onClick={notifyPatient}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition"
            >
              <FaBell />
              Notify Patient
            </button>
          </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorVideoCallLobby;