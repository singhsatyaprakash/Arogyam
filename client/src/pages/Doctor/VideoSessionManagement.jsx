// VideoSessionManagement.jsx
import React, { useEffect, useMemo, useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { FaVideo, FaCalendarAlt, FaHistory, FaPlay, FaUser } from 'react-icons/fa';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PROTO_DOCTOR_ID = 'doctor@gmail.com';
const PROTO_PATIENT_ID = 'patient@gmail.com';
const PROTO_CALL_ROOM_ID = `call_${PROTO_DOCTOR_ID}_${PROTO_PATIENT_ID}`;

const VideoSessionManagement = () => {
  const nav = useNavigate();
  const { isConnected, currentUser, scheduleCall, onCallScheduled, joinVideoRoom, startCall } = useSocket();

  const doctorId = PROTO_DOCTOR_ID;
  const [patientId, setPatientId] = useState(PROTO_PATIENT_ID);
  const [scheduledFor, setScheduledFor] = useState(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  });

  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await fetch(`${API_URL}/api/calls/schedule?doctorId=${encodeURIComponent(doctorId)}`).catch(() => null);
    const data = res && res.ok ? await res.json() : null;
    setItems(data?.items || []);
  };

  useEffect(() => {
    if (!doctorId) return;
    load();
  }, [doctorId]);

  useEffect(() => {
    // live updates
    const unsub = onCallScheduled((s) => {
      if (String(s?.doctorId) === String(doctorId)) load();
    });
    return () => unsub?.();
  }, [doctorId, onCallScheduled]);

  const upcomingSessions = useMemo(
    () => items.filter(x => x.status === 'scheduled').slice(0, 20),
    [items]
  );

  const sessionHistory = useMemo(
    () => items.filter(x => x.status !== 'scheduled').slice(0, 20),
    [items]
  );

  const doSchedule = () => {
    if (!isConnected) return;
    scheduleCall(PROTO_CALL_ROOM_ID, PROTO_DOCTOR_ID, PROTO_PATIENT_ID, new Date(scheduledFor).toISOString());
  };

  const joinNow = (session) => {
    if (!isConnected) return;
    joinVideoRoom(PROTO_CALL_ROOM_ID, PROTO_DOCTOR_ID, 'doctor', currentUser || { id: PROTO_DOCTOR_ID, type: 'doctor' });
    startCall(PROTO_CALL_ROOM_ID, PROTO_DOCTOR_ID, PROTO_PATIENT_ID);
    nav(`/doctor/video-call/${encodeURIComponent(PROTO_CALL_ROOM_ID)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />

      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, Dr. Satyal</h1>
            <p className="text-gray-500">Friday, December 19, 2025</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaVideo className="text-red-500" />
              Video Session Management
            </h2>
            <p className="text-gray-500">Manage your telemedicine appointments</p>
          </div>

          {/* Quick Schedule Form */}
          <div className="mb-6 bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaCalendarAlt /> Schedule Prototype Call
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                value={patientId}
                readOnly
                placeholder="patient-1"
              />
              <input
                type="datetime-local"
                className="p-3 border border-gray-300 rounded-lg"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
              />
              <button
                onClick={doSchedule}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
              >
                Schedule
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Sessions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <FaCalendarAlt />
                  Upcoming Sessions
                </h3>
                <span className="text-sm text-gray-500">{upcomingSessions.length} sessions</span>
              </div>

              {upcomingSessions.map((session) => (
                <div key={session._id || session.id} className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-red-500 text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{session.patientId}</h4>
                        <p className="text-sm text-gray-500">{new Date(session.scheduledFor).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => joinNow(session)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                      <FaPlay />
                      Join Call
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Session History */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <FaHistory />
                    Session History
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {sessionHistory.map((session) => (
                      <div key={session._id || session.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-800">{session.patientId}</h4>
                          <p className="text-sm text-gray-500">{new Date(session.scheduledFor).toLocaleString()}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {session.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Video Call Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Calls Today</span>
                    <span className="font-semibold text-gray-800">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Duration</span>
                    <span className="font-semibold text-gray-800">35 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Settings */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Video Call Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Consultation Time
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer Time Between Calls
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                </select>
              </div>
            </div>
            <button className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition">
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoSessionManagement;