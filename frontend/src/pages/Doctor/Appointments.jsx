// Appointments.jsx
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { FaClock, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { DoctorContext } from '../../contexts/DoctorContext';

const API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:3000';

const Appointments = () => {
  const { doctor, token } = useContext(DoctorContext);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // all | booked | completed | cancelled
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrMsg('');
    try {
      const res = await axios.get(`${API_URL}/appointments/doctor/me`, authHeaders);
      if (res.data?.success) setAppointments(Array.isArray(res.data.data) ? res.data.data : []);
      else setErrMsg(res.data?.message || 'Failed to load appointments');
    } catch (e) {
      setErrMsg(e?.response?.data?.message || e.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [ token, authHeaders]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filtered = useMemo(() => {
    if (filter === 'all') return appointments;
    return appointments.filter((a) => String(a.status) === filter);
  }, [appointments, filter]);

  const onDoctorCancel = async (appointmentId) => {
    const reason = window.prompt('Cancel reason (optional):', '') || '';
    try {
      await axios.post(
        `${API_URL}/appointments/${appointmentId}/doctor-cancel`,
        { reason },
        authHeaders
      );
      await fetchAppointments();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Cancel failed');
    }
  };

  const onDoctorReschedule = async (appointmentId) => {
    const date = window.prompt('New date (YYYY-MM-DD):', '') || '';
    const time = window.prompt('New time (HH:MM, 24h):', '') || '';
    try {
      await axios.post(
        `${API_URL}/appointments/${appointmentId}/doctor-reschedule`,
        { date, time },
        authHeaders
      );
      await fetchAppointments();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Reschedule failed');
    }
  };

  const prettyWhen = (a) => {
    const d = a?.scheduledAt ? new Date(a.scheduledAt) : null;
    if (!d || Number.isNaN(d.getTime())) return `${a?.date || ''} ${a?.startTime || ''}`.trim();
    return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />

      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome back{doctor?.name ? `, Dr. ${doctor.name}` : ''}
            </h1>
            <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Appointments</h2>
            <div className="flex gap-2">
              {['all', 'booked', 'completed', 'cancelled'].map((k) => (
                <button
                  key={k}
                  className={`px-4 py-2 rounded-lg ${
                    filter === k ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                  }`}
                  onClick={() => setFilter(k)}
                >
                  {k === 'booked' ? 'Upcoming' : k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="text-gray-500">Loading...</div>}
          {errMsg && <div className="text-red-600 mb-3">{errMsg}</div>}

          {/* Appointments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-red-500" />
                    <span className="font-semibold text-gray-800">{prettyWhen(a)}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      a.status === 'booked'
                        ? 'bg-blue-100 text-blue-600'
                        : a.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{a?.patient?.name || 'Patient'}</h3>
                    <p className="text-sm text-gray-500">{a.type}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    disabled={a.status !== 'booked'}
                    onClick={() => alert('Start session hook goes here')}
                  >
                    Start Session
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    disabled={a.status !== 'booked'}
                    onClick={() => onDoctorReschedule(a._id)}
                  >
                    Reschedule
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    disabled={a.status !== 'booked'}
                    onClick={() => onDoctorCancel(a._id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-gray-500 text-sm">Total</h3>
              <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-gray-500 text-sm">Upcoming</h3>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter((x) => x.status === 'booked').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h3 className="text-gray-500 text-sm">Completed</h3>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter((x) => x.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Appointments;