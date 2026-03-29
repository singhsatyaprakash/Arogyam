import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorNavbar from "../../doctorComponent/DoctorNavbar";
import { FaClock, FaUser, FaSync, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { DoctorContext } from "../../contexts/DoctorContext";
import AppointmentReschedule from "../../doctorComponent/AppointmentReschedule";
import AppointmentCancel from "../../doctorComponent/AppointmentCancel";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

const getLocalIsoDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Appointments = () => {
  const { doctor } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("booked");
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
    const todayIso = getLocalIsoDate();
    const base =
      filter === "all"
        ? appointments
        : filter === "today"
        ? appointments.filter((a) => a?.date === todayIso)
        : appointments.filter((a) => a.status === filter);

    return [...base].sort((a, b) => {
      const aTs = new Date(`${a?.date || ""}T${a?.startTime || "00:00"}`).getTime();
      const bTs = new Date(`${b?.date || ""}T${b?.startTime || "00:00"}`).getTime();

      const safeA = Number.isNaN(aTs) ? Number.POSITIVE_INFINITY : aTs;
      const safeB = Number.isNaN(bTs) ? Number.POSITIVE_INFINITY : bTs;
      return safeA - safeB;
    });
  }, [appointments, filter]);

  const counts = useMemo(() => {
    const booked = appointments.filter((x) => x.status === "booked").length;
    const completed = appointments.filter((x) => x.status === "completed").length;
    const cancelled = appointments.filter((x) => x.status === "cancelled").length;
    const today = getLocalIsoDate();
    const todayCount = appointments.filter((x) => x?.date === today).length;
    return {
      all: appointments.length,
      booked,
      today: todayCount,
      completed,
      cancelled,
    };
  }, [appointments]);

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
    if (status === "booked") return "bg-blue-50 text-blue-700 border border-blue-200";
    if (status === "completed") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (status === "cancelled") return "bg-red-50 text-red-700 border border-red-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const typeStyle = (type) => {
    if (type === "video") return "bg-violet-50 text-violet-700 border border-violet-200";
    if (type === "voice") return "bg-amber-50 text-amber-700 border border-amber-200";
    if (type === "in-person") return "bg-sky-50 text-sky-700 border border-sky-200";
    return "bg-gray-50 text-gray-700 border border-gray-200";
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-gray-50">
      <DoctorNavbar />

      <main className="p-4 sm:p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6 rounded-2xl sm:rounded-3xl border border-rose-100 bg-gradient-to-r from-white to-rose-50/60 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Welcome back
                  {doctor?.doctor?.name && `, Dr. ${doctor.doctor.name}`}
                </h1>

                <p className="text-gray-600 mt-1 inline-flex items-center gap-2">
                  <FaCalendarAlt className="text-rose-500" />
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <button
                onClick={fetchAppointments}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition shadow-sm"
              >
                <FaSync />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            {["all", "booked", "today", "completed", "cancelled"].map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  filter === k
                    ? "bg-red-500 border-red-500 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                <span>
                  {k === "booked"
                    ? "Upcoming"
                    : k === "today"
                    ? "Today"
                    : k.charAt(0).toUpperCase() + k.slice(1)}
                </span>
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs ${filter === k ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"}`}>
                  {counts[k]}
                </span>
              </button>
            ))}
          </div>

          {loading && <p className="text-gray-500 mb-4">Loading appointments...</p>}
          {errMsg && <p className="text-red-600 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errMsg}</p>}

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-sm">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{counts.all}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm">
              <p className="text-blue-600 text-sm font-medium">Upcoming</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{counts.booked}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm sm:col-span-2 lg:col-span-1">
              <p className="text-emerald-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{counts.completed}</p>
            </div>
          </div>

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-500 py-14 bg-white border border-dashed border-gray-300 rounded-2xl">
              No appointments found
            </div>
          )}

          {/* Cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((a) => {
              const notes = a?.notes || "NA";
              const isLong = notes.length > 100;
              const showFull = expandedNotes[a._id];

              return (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition"
                >
                  {/* Date */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex gap-2 items-center text-gray-700 min-w-0">
                      <FaClock className="text-red-500" />
                      <span className="font-semibold text-sm sm:text-base leading-tight break-words">{formatDate(a)}</span>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full capitalize whitespace-nowrap ${statusStyle(
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
                      <p className={`text-xs inline-flex px-2.5 py-1 rounded-full mt-1 capitalize ${typeStyle(a.type)}`}>{a.type}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[76px]">
                    <span className="font-semibold text-gray-700">
                      Notes:
                    </span>{" "}
                    {isLong && !showFull
                      ? notes.slice(0, 100) + "..."
                      : notes}

                    {isLong && (
                      <button
                        onClick={() => toggleNotes(a._id)}
                        className="ml-2 text-red-500 text-sm font-medium"
                      >
                        {showFull ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <button
                      disabled={a.status !== "booked"}
                      onClick={() => startAppointment(a)}
                      className="w-full sm:w-auto sm:flex-1 bg-red-500 text-white px-3 py-2.5 rounded-xl hover:bg-red-600 disabled:opacity-40 transition text-sm font-medium whitespace-nowrap"
                    >
                      {a.type === "video" ? "Start Video" : "Start"}
                    </button>

                    <button
                      disabled={a.status !== "booked"}
                      onClick={() => openRescheduleModal(a)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition text-sm font-medium whitespace-nowrap"
                    >
                      Reschedule
                    </button>

                    <button
                      disabled={a.status !== "booked"}
                      onClick={() => openCancelModal(a)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition text-sm font-medium whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>

                  {a.status === "completed" && (
                    <div className="mt-3 inline-flex items-center gap-2 text-emerald-700 text-sm font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                      <FaCheckCircle /> Consultation completed
                    </div>
                  )}
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