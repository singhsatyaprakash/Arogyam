import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useDoctor } from '../contexts/DoctorContext';

const API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:3000';

const UpcomingAppointments = () => {
  const { token, isAuthenticated } = useDoctor();
  const [items, setItems] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchUpcoming = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    setErrMsg('');
    try {
      const res = await axios.get(
        `${API_URL}/appointments/doctor/me/upcoming`,
        authHeaders
      );
      if (res.data?.success)
        setItems(Array.isArray(res.data.data) ? res.data.data : []);
      else setErrMsg(res.data?.message || 'Failed to load upcoming appointments');
    } catch (e) {
      setErrMsg(
        e?.response?.data?.message || e.message || 'Failed to load upcoming appointments'
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, authHeaders]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Upcoming</h3>
        <button className="text-sm text-red-600" onClick={fetchUpcoming}>
          Refresh
        </button>
      </div>

      {loading && <div className="text-gray-500 text-sm">Loading...</div>}
      {errMsg && <div className="text-red-600 text-sm">{errMsg}</div>}

      <div className="space-y-2">
        {items.slice(0, 8).map((a) => (
          <div
            key={a._id}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
          >
            <div>
              <div className="text-sm font-medium text-gray-800">
                {a?.patient?.name || 'Patient'}
              </div>
              <div className="text-xs text-gray-500">
                {(a?.date || '')} {(a?.startTime || '')} • {a?.type || ''}
              </div>
            </div>
            <div className="text-xs text-blue-600">{a.status}</div>
          </div>
        ))}
        {!loading && !errMsg && items.length === 0 && (
          <div className="text-gray-500 text-sm">No upcoming appointments.</div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointments;