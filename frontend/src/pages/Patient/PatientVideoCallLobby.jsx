import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaClock, FaStethoscope, FaUserCircle, FaVideo } from "react-icons/fa";
import PatientNavbar from "../../patientComponent/PatientNavbar";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

const PatientVideoCallLobby = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const location = useLocation();

  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("patientToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const handleSession = useCallback(async () => {
    if (!appointmentId) return;

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
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to prepare video session");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, authHeaders]);

  useEffect(() => {
    if (!appointmentId) {
      setErr("No appointment selected.");
      setLoading(false);
      return;
    }
    handleSession();
  }, [appointmentId, handleSession]);

  const startCall = () => {
    if (!session?._id) return;
    const role = localStorage.getItem("role") || "patient";

    navigate(`/patient/video-call/${session._id}`, {
      state: { role, session, appointment, doctor, patient },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />

      <main className="pt-16 lg:pt-6 lg:ml-64 p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-green-700"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">Patient Video Call Lobby</h1>

          {loading && (
            <p className="mt-4 text-sm text-gray-600">Preparing your video session...</p>
          )}

          {!loading && err && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && (
            <>
              <div className="mt-6 flex items-center gap-4 border-b pb-5">
                {doctor?.profileImage ? (
                  <img
                    src={doctor.profileImage}
                    alt="doctor"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-6xl text-gray-400" />
                )}

                <div>
                  <p className="text-lg font-semibold text-gray-900">{doctor?.name || "Doctor"}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <FaStethoscope /> {doctor?.specialization || "Specialization not available"}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <FaClock /> {appointment?.date} | {appointment?.startTime} - {appointment?.endTime}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={startCall}
                  disabled={!session?._id}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaVideo /> Join Video Call
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientVideoCallLobby;
