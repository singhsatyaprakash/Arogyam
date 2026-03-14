import React, { useEffect, useMemo, useState, useCallback, useContext } from "react";
import axios from "axios";
import { FaCalendarAlt, FaSearch, FaTimes } from "react-icons/fa";
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
  const [filter, setFilter] = useState("upcoming");
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

      const sorted = [...list].sort(
        (a, b) => getAppointmentTime(b) - getAppointmentTime(a)
      );

      setAppointments(sorted);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, patient]);

  const joinVideoCall = useCallback(
    async (appointment) => {
      if (appointment?.type !== "video") {
        setErr("Only video appointments can open the consultation room.");
        return;
      }

      try {
        if (!appointment?._id) {
          throw new Error("Missing appointment id.");
        }

        navigate(`/patient/video-call-lobby/${appointment._id}`, {
          state: { appointment },
        });
      } catch (error) {
        setErr(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to open video consultation room"
        );
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ---------------- FILTER ---------------- */

  const filtered = useMemo(() => {
    const now = Date.now();

    return appointments.filter((a) => {
      const time = getAppointmentTime(a);
      const status = (a?.status || "").toLowerCase();

      if (filter === "cancelled") return status === "cancelled";

      if (filter === "upcoming")
        return status === "booked" && time >= now;

      if (filter === "past")
        return status !== "cancelled" && time < now;

      return true;
    });
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
    const now = Date.now();

    return {
      upcoming: appointments.filter(
        (a) =>
          a.status === "booked" &&
          getAppointmentTime(a) >= now
      ).length,

      past: appointments.filter(
        (a) =>
          a.status !== "cancelled" &&
          getAppointmentTime(a) < now
      ).length,

      cancelled: appointments.filter(
        (a) => a.status === "cancelled"
      ).length,

      all: appointments.length,
    };
  }, [appointments]);

  const tabs = [
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "past", label: "Past", count: counts.past },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
    { key: "all", label: "All", count: counts.all },
  ];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />

      <main className="pt-16 lg:pt-6 lg:ml-64 px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl py-8 space-y-6">

          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <FaCalendarAlt className="text-green-600" />
              My Appointments
            </h1>

            {!selected && (
              <button
                onClick={fetchAppointments}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
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
                  className={`bg-white border rounded-lg p-4 text-left transition hover:shadow ${
                    filter === t.key
                      ? "border-green-600 ring-1 ring-green-600"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-sm text-gray-500">{t.label}</div>
                  <div className="text-2xl font-bold">{t.count}</div>
                </button>
              ))}
            </div>
          )}

          {/* Tabs + Search */}
          {!selected && (
            <div className="flex flex-wrap justify-between gap-4">

              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                {tabs.map((t) => {
                  const active = filter === t.key;

                  return (
                    <button
                      key={t.key}
                      onClick={() => setFilter(t.key)}
                      className={`px-4 py-2 rounded-full border text-sm ${
                        active
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {t.label}
                      <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
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
                  className="w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm"
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
            <div className="bg-red-50 border border-red-200 p-4 text-red-700 rounded">
              {err}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredByQuery.length === 0 && !selected && (
            <div className="bg-white border rounded-lg p-6 text-center">
              <p className="font-medium">No appointments found</p>

              <button
                onClick={() => {
                  setFilter("upcoming");
                  setQuery("");
                }}
                className="mt-4 border px-4 py-2 rounded-md"
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