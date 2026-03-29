import React, { useEffect, useMemo, useState, useCallback, useContext } from "react";
import axios from "axios";
import { FaCalendarAlt, FaSearch, FaTimes, FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { PatientContext } from "../../contexts/PatientContext";
import AppointmentCard from "../../patientComponent/AppointmentCard";
import AppointmentDeatilsModel from "../../patientComponent/AppointmentDeatilsModel";
import PatientNavbar from "../../patientComponent/PatientNavbar";

/* ---------------- HELPERS ---------------- */

const getAppointmentTime = (a) => {
  if (!a?.date || !a?.startTime) return 0;
  return new Date(`${a.date}T${a.startTime}`).getTime();
};

const getTodayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start: start.getTime(), end: end.getTime() };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ---------------- COMPONENT ---------------- */

const BookedAppointment = () => {
  const { patient, token } = useContext(PatientContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("today");
  const [query, setQuery] = useState("");

  const authHeaders = useMemo(() => {
    const tkn = token || localStorage.getItem("token");
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token]);

  /* ---------------- FETCH ---------------- */

  const fetchAppointments = useCallback(async () => {
    const patientId = patient?.patient?._id;
    if (!patientId) return;

    setLoading(true);
    setErr("");

    try {
      const res = await axios.get(
        `${API_URL}/appointments/patient/${patientId}`,
        { headers: authHeaders }
      );

      const list = Array.isArray(res?.data?.data) ? res.data.data : [];

      setAppointments(list);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, patient]);

  const joinVideoCall = useCallback(
    async (appointment) => {
      if(appointment?.type == "video") {
      navigate(`/patient/video-call-lobby/${appointment._id}`, {
        state: { appointment },
        replace: true,
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

      // try {
      //   if (!appointment?._id) {
      //     throw new Error("Missing appointment id.");
      //   }

      //   const res = await axios.post(
      //     `${API_URL}/videos/appointments/${appointment._id}/session/patient`,
      //     {},
      //     { headers: authHeaders }
      //   );

      //   if (!res?.data?.success || !res?.data?.data?._id) {
      //     throw new Error(res?.data?.message || "Unable to prepare video session");
      //   }

      //   const sessionData = res.data.data;

      //   navigate(`/patient/video-call-lobby/${appointment._id}`, {
      //     state: {
      //       appointment: sessionData?.appointment || appointment,
      //       session: sessionData,
      //       doctor: sessionData?.doctor,
      //       patient: sessionData?.patient,
      //     },
      //   });
      // } catch (error) {
      //   setErr(
      //     error?.response?.data?.message ||
      //       error?.message ||
      //       "Unable to open video consultation room"
      //   );
      // }
    },
    [navigate]
  );

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    const { start, end } = getTodayBounds();

    const base = appointments.filter((a) => {
      const time = getAppointmentTime(a);
      const status = (a?.status || "").toLowerCase();

      if (filter === "cancelled") return status === "cancelled";

      if (filter === "today")
        return status === "booked" && time >= start && time <= end;

      if (filter === "upcoming")
        return status === "booked" && time > end;

      if (filter === "past")
        return status !== "cancelled" && time < start;

      return true;
    });

    if (filter === "today" || filter === "upcoming") {
      return [...base].sort((a, b) => getAppointmentTime(a) - getAppointmentTime(b));
    }

    if (filter === "past") {
      return [...base].sort((a, b) => getAppointmentTime(b) - getAppointmentTime(a));
    }

    return base;
  }, [appointments, filter]);

  /* ---------------- SEARCH ---------------- */

  const filteredByQuery = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return filtered;

    return filtered.filter((a) => {
      const doctor = (a?.doctor?.name || "").toLowerCase();
      const spec = (a?.doctor?.specialization || "").toLowerCase();
      const type = (a?.type || "").toLowerCase();
      const date = formatDate(a?.date).toLowerCase();

      return (
        doctor.includes(q) ||
        spec.includes(q) ||
        type.includes(q) ||
        date.includes(q)
      );
    });
  }, [filtered, query]);

  /* ---------------- COUNTS ---------------- */

  const counts = useMemo(() => {
    const { start, end } = getTodayBounds();

    return {
      today: appointments.filter(
        (a) =>
          a.status === "booked" &&
          getAppointmentTime(a) >= start &&
          getAppointmentTime(a) <= end
      ).length,

      upcoming: appointments.filter(
        (a) =>
          a.status === "booked" &&
          getAppointmentTime(a) > end
      ).length,

      past: appointments.filter(
        (a) =>
          a.status !== "cancelled" &&
          getAppointmentTime(a) < start
      ).length,

      cancelled: appointments.filter(
        (a) => a.status === "cancelled"
      ).length,

      all: appointments.length,
    };
  }, [appointments]);

  const tabs = [
    { key: "today", label: "Today", count: counts.today },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "past", label: "Past", count: counts.past },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
    { key: "all", label: "All", count: counts.all },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <PatientNavbar />

      <main className="pt-16 lg:pt-6 lg:ml-64 px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl py-8 space-y-6">

          {/* Header */}
          <div className="rounded-2xl border border-emerald-100 bg-white/90 shadow-sm backdrop-blur p-6 md:p-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <FaCalendarAlt />
                </span>
                My Appointments
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Track upcoming visits, revisit past consultations, and join sessions on time.
              </p>
            </div>

            {!selected && (
              <button
                onClick={fetchAppointments}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            )}
          </div>

          {/* Stats */}
          {!selected && (
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`rounded-xl p-4 text-left transition border bg-white/95 shadow-sm hover:shadow-md ${
                    filter === t.key
                      ? "border-emerald-600 ring-2 ring-emerald-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-sm text-gray-500 uppercase tracking-wide">{t.label}</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{t.count}</div>
                </button>
              ))}
            </div>
          )}

          {/* Tabs + Search */}
          {!selected && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm flex flex-wrap justify-between gap-4">

              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                {tabs.map((t) => {
                  const active = filter === t.key;

                  return (
                    <button
                      key={t.key}
                      onClick={() => setFilter(t.key)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                        active
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-emerald-300"
                      }`}
                    >
                      {t.label}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${active ? "bg-emerald-500/40 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-96">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctor, specialty, type..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {err && (
            <div className="bg-red-50 border border-red-200 p-4 text-red-700 rounded-lg shadow-sm">
              {err}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredByQuery.length === 0 && !selected && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <p className="font-semibold text-gray-800">No appointments found</p>
              <p className="mt-1 text-sm text-gray-500">Try switching tabs or clearing search terms.</p>

              <button
                onClick={() => {
                  setFilter("today");
                  setQuery("");
                }}
                className="mt-4 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Details Modal */}
          {selected && (
            <AppointmentDeatilsModel
              open={true}
              appointment={selected}
              onJoinVideo={joinVideoCall}
              onClose={() => setSelected(null)}
              onUpdated={fetchAppointments}
              onCancelled={fetchAppointments}
            />
          )}

          {/* Cards */}
          {!selected && !loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredByQuery.map((appt) => (
                <AppointmentCard
                  key={appt._id}
                  appointment={appt}
                  onJoinVideo={joinVideoCall}
                  onView={() => setSelected(appt)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookedAppointment;