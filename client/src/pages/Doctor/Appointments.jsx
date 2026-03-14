import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorNavbar from "../../doctorComponent/DoctorNavbar";
import { FaClock, FaUser, FaSync } from "react-icons/fa";
import axios from "axios";
import { DoctorContext } from "../../contexts/DoctorContext";
import AppointmentReschedule from "../../doctorComponent/AppointmentReschedule";
import AppointmentCancel from "../../doctorComponent/AppointmentCancel";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

const Appointments = () => {
  const { doctor } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [expandedNotes, setExpandedNotes] = useState({});
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const authHeaders = useMemo(() => {
    const token = doctor?.token || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [doctor?.token]);
  //fetch all appointment's details of the doctor...
  const fetchAppointments = useCallback(async () => {
    if (!doctor?.doctor?._id) return;

    setLoading(true);
    setErrMsg("");

    try {
      const res = await axios.get(
        `${API_URL}/appointments/doctor/${doctor.doctor._id}/list`
      );

      if (res.data?.success) {
        setAppointments(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setErrMsg(res.data?.message || "Failed to load appointments");
      }
    } catch (e) {
      setErrMsg(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [doctor?.doctor?._id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filtered = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const toggleNotes = (id) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (a) => {
    if (!a?.date) return "NA";

    const d = new Date(`${a.date}T${a.startTime}`);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }) + ` • ${a.startTime}`;
  };

  const openCancelModal = (appointment) => {
    setActiveAppointment(appointment);
    setCancelModalOpen(true);
  };

  const openRescheduleModal = (appointment) => {
    setActiveAppointment(appointment);
    setRescheduleModalOpen(true);
  };
  //cancel the appointment by doctor with reason and also update the appointment status to cancelled in database...
  const onDoctorCancel = async (reason) => {
    if (!activeAppointment?._id) return;

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/appointments/${activeAppointment._id}/doctor-cancel`,
        { reason },
        { headers: { "Content-Type": "application/json", ...authHeaders } }
      );

      setCancelModalOpen(false);
      setActiveAppointment(null);
      await fetchAppointments();
    } catch (e) {
      alert(e?.response?.data?.message || "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  };
  //reschedule the appointment by doctor with new date and time and also update the appointment details in database...
  const onDoctorReschedule = async ({ date, time }) => {
    if (!activeAppointment?._id) return;

    setActionLoading(true);
    try {
      await axios.post(
        `${API_URL}/appointments/${activeAppointment._id}/doctor-reschedule`,
        { date, time },
        { headers: { "Content-Type": "application/json", ...authHeaders } }
      );

      setRescheduleModalOpen(false);
      setActiveAppointment(null);
      await fetchAppointments();
    } catch (e) {
      alert(e?.response?.data?.message || "Reschedule failed");
    } finally {
      setActionLoading(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "booked") return "bg-blue-100 text-blue-600";
    if (status === "completed") return "bg-green-100 text-green-600";
    if (status === "cancelled") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  const startAppointment = async (appointment) => {
    // console.log(appointment);

    if(appointment?.type == "video") {
      navigate(`/doctor/video-call-lobby/${appointment._id}`, {
        state: { appointment },
      });
      return;
    }
    else if(appointment?.type === "in-person") {
      alert("In-person appointment started. Please proceed with the consultation.");
      return;
    }
    else if(appointment?.type === "voice") {
      alert("Voice appointment started. Please proceed with the consultation.");
      return;
    }
    
    // if (appointment?.type !== "video") {
    //   alert("Only video appointments can be started from this button.");
    //   return;
    // }

    // try {
    //   const res = await axios.post(
    //     `${API_URL}/videos/appointments/${appointment._id}/session/doctor`,
    //     {},
    //     { headers: authHeaders }
    //   );
    //   if(!res.data?.success) {
    //     alert(res.data?.message || "Session not created..");
    //     return;
    //   }
    //   const session= res.data?.data;
    //   console.log(session);
    //   if (!session?._id) {
    //     throw new Error("Video session could not be created.");
    //   }

    //   navigate(`/doctor/video-call/${session._id}`, {
    //     state: {session },
    //   });
    // } catch (error) {
    //   alert(error?.response?.data?.message || error?.message || "Unable to start video consultation");
    // }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />

      <main className="p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back
                {doctor?.doctor?.name && `, Dr. ${doctor.doctor.name}`}
              </h1>

              <p className="text-gray-500">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <button
              onClick={fetchAppointments}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              <FaSync />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["all", "booked", "completed", "cancelled"].map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-lg ${
                  filter === k
                    ? "bg-red-500 text-white"
                    : "bg-white border text-gray-600"
                }`}
              >
                {k === "booked"
                  ? "Upcoming"
                  : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>

          {loading && <p className="text-gray-500">Loading appointments...</p>}
          {errMsg && <p className="text-red-500">{errMsg}</p>}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              No appointments found
            </div>
          )}
          {/* Stats */}
          <div className="m-10 grid md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <p className="text-gray-500">Total</p>
              <p className="text-3xl font-bold">{appointments.length}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <p className="text-gray-500">Upcoming</p>
              <p className="text-3xl font-bold">
                {appointments.filter((x) => x.status === "booked").length}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <p className="text-gray-500">Completed</p>
              <p className="text-3xl font-bold">
                {appointments.filter((x) => x.status === "completed").length}
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((a) => {
              const notes = a?.notes || "NA";
              const isLong = notes.length > 100;
              const showFull = expandedNotes[a._id];

              return (
                <div
                  key={a._id}
                  className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition"
                >
                  {/* Date */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2 items-center text-gray-700">
                      <FaClock className="text-red-500" />
                      <span className="font-semibold">{formatDate(a)}</span>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full ${statusStyle(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>

                  {/* Patient */}
                  <div className="flex gap-3 items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-red-500" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {a?.patient?.name || "Patient"}
                      </h3>
                      <p className="text-sm text-gray-500">{a.type}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-semibold text-gray-700">
                      Notes:
                    </span>{" "}
                    {isLong && !showFull
                      ? notes.slice(0, 100) + "..."
                      : notes}

                    {isLong && (
                      <button
                        onClick={() => toggleNotes(a._id)}
                        className="ml-2 text-red-500 text-sm"
                      >
                        {showFull ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      disabled={a.status !== "booked"}
                      onClick={() => startAppointment(a)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-40"
                    >
                      {a.type === "video" ? "Start Video" : "Start"}
                    </button>

                    <button
                      disabled={a.status !== "booked"}
                      onClick={() => openRescheduleModal(a)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Reschedule
                    </button>

                    <button
                      disabled={a.status !== "booked"}
                      onClick={() => openCancelModal(a)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <AppointmentReschedule
            open={rescheduleModalOpen}
            appointment={activeAppointment}
            doctorId={doctor?.doctor?._id}
            authHeaders={authHeaders}
            loading={actionLoading}
            onClose={() => {
              if (actionLoading) return;
              setRescheduleModalOpen(false);
              setActiveAppointment(null);
            }}
            onSubmit={onDoctorReschedule}
          />

          <AppointmentCancel
            open={cancelModalOpen}
            appointment={activeAppointment}
            loading={actionLoading}
            onClose={() => {
              if (actionLoading) return;
              setCancelModalOpen(false);
              setActiveAppointment(null);
            }}
            onSubmit={onDoctorCancel}
          />
        </div>
      </main>
    </div>
  );
};

export default Appointments;