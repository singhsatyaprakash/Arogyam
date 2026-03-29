import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaClock, FaStethoscope, FaUserCircle, FaVideo } from "react-icons/fa";
import PatientNavbar from "../../patientComponent/PatientNavbar";
import { useSocket } from "../../contexts/SocketContext";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

const PatientVideoCallLobby = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const location = useLocation();
  const socket = useSocket();

  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [patient, setPatient] = useState(location.state?.patient || null);
  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [err, setErr] = useState("");
  const callPayloadRef = useRef(null);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("patientToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const socketCommunication = useCallback(
    (sessionData) => {
      if (!socket || !sessionData?._id || !sessionData?.roomId) return;

      socket.emit("room:join", {
        sessionId: sessionData._id,
        roomId: sessionData.roomId,
      });
    },
    [socket]
  );

  const handleJoinedRoom = useCallback(
    () => {
      const callPayload =
        callPayloadRef.current || { role: "patient", session, appointment, doctor, patient };

      if (!callPayload?.session?._id) {
        setIsJoining(false);
        setErr("Session is not ready yet. Please try again.");
        return;
      }
      console.log(callPayload);
      navigate(`/patient/video-call/${callPayload.session.roomId}`, {
        state: callPayload,
      });

      setIsJoining(false);
    },
    [navigate, session, appointment, doctor, patient]
  );

  const handleSession = useCallback(async () => {
    if (!appointmentId) {
      setErr("No appointment selected.");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const response = await axios.post(
        `${API_URL}/videos/appointments/${appointmentId}/session/patient`,
        {},
        { headers: authHeaders }
      );

      if (!response?.data?.success || !response?.data?.data?._id) {
        throw new Error(response?.data?.message || "Unable to prepare session");
      }

      const activeSession = response.data.data;
      setSession(activeSession);
      setAppointment(activeSession.appointment);
      setDoctor(activeSession.doctor);
      setPatient(activeSession.patient);

      callPayloadRef.current = {
        role: "patient",
        session: activeSession,
        appointment: activeSession.appointment,
        doctor: activeSession.doctor,
        patient: activeSession.patient,
      };
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to prepare video session");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, authHeaders]);

  useEffect(() => {
    if (!socket) {
      setErr("Socket connection error. Please reload and try again.");
      return;
    }

    handleSession();
  }, [socket, handleSession]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room:joined", handleJoinedRoom);
    return () => {
      socket.off("room:joined", handleJoinedRoom);
    };
  }, [socket, handleJoinedRoom]);

  const startCall = () => {
    if (!session?.roomId || !session?._id) {
      setErr("Session is not ready yet. Please try again in a moment.");
      return;
    }

    setIsJoining(true);
    callPayloadRef.current = {
      role: "patient",
      session,
      appointment,
      doctor,
      patient,
    };

    socketCommunication(session);
  };

  const formattedDate = appointment?.date
    ? new Date(appointment.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "NA";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-cyan-50/40">
      <PatientNavbar />

      <main className="relative pt-16 lg:pt-6 lg:ml-64 px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 sm:left-6 top-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="mx-auto max-w-4xl pt-14">

          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 p-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900">Video Call Lobby</h1>
              <p className="mt-1 text-sm text-gray-600">Review your session details and join when ready.</p>
            </div>

            <div className="p-5 sm:p-6">

              {loading && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">Preparing your video session...</p>
                </div>
              )}

              {!loading && err && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {err}
                </div>
              )}

              {!loading && !err && (
                <>
                  <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {doctor?.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt="doctor"
                          className="h-16 w-16 rounded-full object-cover border border-emerald-200"
                        />
                      ) : (
                        <FaUserCircle className="text-6xl text-gray-400" />
                      )}

                      <div>
                        <p className="text-lg font-semibold text-gray-900">{doctor?.name || "Doctor"}</p>
                        <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          <FaStethoscope /> {doctor?.specialization || "Specialization not available"}
                        </p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <FaClock /> {formattedDate} | {appointment?.startTime} - {appointment?.endTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={startCall}
                      disabled={!session?.roomId || isJoining}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-white font-medium hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaVideo /> {isJoining ? "Joining..." : "Join Video Call"}
                    </button>

                    <p className="text-xs text-gray-500">Make sure your camera and microphone are ready.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientVideoCallLobby;
