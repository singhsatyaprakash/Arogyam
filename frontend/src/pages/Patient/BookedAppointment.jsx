import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { usePatientContext } from '../../contexts/PatientContext';
import AppointmentCard from '../../patientComponent/AppointmentCard';
import AppointmentDeatilsModel from '../../patientComponent/AppointmentDeatilsModel';
import PatientNavbar from '../../patientComponent/PatientNavbar';

const BookedAppointment = () => {
  const { API_URL, patient, token } = usePatientContext();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | cancelled | all
  const [query, setQuery] = useState('');

  const authHeaders = useMemo(() => {
    const tkn = token || localStorage.getItem('token');
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token]);

  const fetchAppointments = useCallback(async () => {
    const patientId = patient?._id;
    if (!patientId) return;

    setLoading(true);
    setErr('');
    try {
      const res = await axios.get(`${API_URL}/appointments/patient/${encodeURIComponent(patientId)}`, { headers: authHeaders });
      const data = res?.data;
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

      // "recent basis" default sort by scheduledAt desc
      const sorted = [...list].sort((a, b) => new Date(b?.scheduledAt || 0) - new Date(a?.scheduledAt || 0));
      setAppointments(sorted);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Something went wrong');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, authHeaders, patient?._id]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const isCancelled = (a) => (a?.status || '').toLowerCase() === 'cancelled';
    const isBooked = (a) => (a?.status || '').toLowerCase() === 'booked';
    const when = (a) => new Date(a?.scheduledAt || 0).getTime();

    const base = appointments;

    if (filter === 'cancelled') return base.filter(isCancelled);
    if (filter === 'all') return base;

    if (filter === 'upcoming') {
      // only booked upcoming; sort soonest first for usability
      return base
        .filter((a) => isBooked(a) && when(a) >= now)
        .sort((a, b) => when(a) - when(b));
    }

    if (filter === 'past') {
      // past includes completed + booked-in-past (if any)
      return base
        .filter((a) => !isCancelled(a) && when(a) < now)
        .sort((a, b) => when(b) - when(a));
    }

    return base;
  }, [appointments, filter]);

  const filteredByQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((a) => {
      const doctor = `${a?.doctorId?.name || ''} ${a?.doctor?.name || ''}`.toLowerCase();
      const spec = `${a?.doctorId?.specialization || ''} ${a?.doctor?.specialization || ''}`.toLowerCase();
      const clinic = `${a?.clinicName || ''} ${a?.clinic?.name || ''}`.toLowerCase();
      return doctor.includes(q) || spec.includes(q) || clinic.includes(q);
    });
  }, [filtered, query]);

  const counts = useMemo(() => {
    const now = Date.now();
    const isCancelled = (a) => (a?.status || '').toLowerCase() === 'cancelled';
    const isBooked = (a) => (a?.status || '').toLowerCase() === 'booked';
    const when = (a) => new Date(a?.scheduledAt || 0).getTime();
    return {
      upcoming: appointments.filter((a) => isBooked(a) && when(a) >= now).length,
      past: appointments.filter((a) => !isCancelled(a) && when(a) < now).length,
      cancelled: appointments.filter(isCancelled).length,
      all: appointments.length
    };
  }, [appointments]);

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { key: 'past', label: 'Past', count: counts.past },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    { key: 'all', label: 'All', count: counts.all }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />

      {/* Layout: no left padding on mobile; add top padding for sticky header; keep sidebar offset on lg */}
      <main className="pt-16 lg:pt-6 lg:pl-64 px-4 sm:px-6 lg:px-8">
        {/* Center + consistent vertical rhythm */}
        <div className="mx-auto max-w-7xl py-6 sm:py-8 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Appointments</h1>
              <p className="mt-1 text-sm text-gray-600">Browse recent appointments, filter by status, and search by doctor or clinic.</p>
            </div>

            {!selected && (
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAppointments}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
          </div>

          {/* Quick stats + Search */}
          {!selected && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={[
                    "rounded-lg border bg-white p-4 text-left transition hover:shadow-sm",
                    filter === t.key ? "border-green-600 ring-1 ring-green-600/30" : "border-gray-200"
                  ].join(' ')}
                >
                  <div className="text-sm text-gray-500">{t.label}</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{t.count}</div>
                </button>
              ))}
            </div>
          )}

          {!selected && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Tabs (pill-style) */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((t) => {
                  const active = filter === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setFilter(t.key)}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-medium border transition",
                        active ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      ].join(' ')}
                    >
                      {t.label}
                      <span className={["ml-2 rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"].join(' ')}>
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-80">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search doctor, specialty, or clinic..."
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          <div>
            {loading && !selected && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
                    <div className="mt-6 h-8 w-full rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Details view (same page): hide grid when selected */}
            {selected && (
              <AppointmentDeatilsModel
                open={true}
                appointment={selected}
                onClose={() => setSelected(null)}
                onUpdated={() => {
                  setSelected(null);
                  fetchAppointments();
                }}
                onCancelled={() => {
                  setSelected(null);
                  fetchAppointments();
                }}
              />
            )}

            {!selected && !loading && filteredByQuery.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                <div className="text-gray-900 font-medium">No appointments found</div>
                <div className="mt-1 text-sm text-gray-600">Try another filter or search term.</div>
                <button
                  onClick={() => { setFilter('upcoming'); setQuery(''); }}
                  className="mt-4 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset filters
                </button>
              </div>
            )}

            {!selected && !loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredByQuery.map((appt) => (
                  <AppointmentCard
                    key={appt?._id || `${appt?.date}-${appt?.startTime}`}
                    appointment={appt}
                    onView={() => setSelected(appt)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookedAppointment;