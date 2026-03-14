import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PatientContext from '../contexts/PatientContext'

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient } = useContext(PatientContext) || {};

  const payload = useMemo(() => {
    const s = location.state || {};
    return {
      doctorId: s.doctorId,
      patientId: s.patientId || patient?._id,
      date: s.date,
      type: s.type,
      time: s.time,
      fee: s.fee,
      doctorName: s.doctor?.name,
    };
  }, [location.state, patient?._id]);

  const [seconds, setSeconds] = useState(10);
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [error, setError] = useState('');

  const canStart = Boolean(payload?.doctorId && payload?.patientId && payload?.date && payload?.type && payload?.time);

  useEffect(() => {
    if (!canStart) return;

    setStatus('processing');
    setError('');
    setSeconds(10);

    const t = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, [canStart]);

  useEffect(() => {
    if (!canStart) return;
    if (status !== 'processing') return;
    if (seconds !== 0) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/appointments/confirm-payment`, {
          doctorId: payload.doctorId,
          patientId: payload.patientId,
          date: payload.date,
          type: payload.type,
          time: payload.time,
        });

        if (cancelled) return;
        if (!res?.data?.success) throw new Error(res?.data?.message || 'Payment confirmation failed');

        setStatus('success');

        // simple redirect after success
        setTimeout(() => navigate('/patient/dashboard'), 800);
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setError(e?.response?.data?.message || e?.message || 'Something went wrong');
      }
    })();

    return () => { cancelled = true; };
  }, [seconds, status, canStart, navigate, payload]);

  if (!canStart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
          <h2 className="text-lg font-semibold text-gray-800">Payment</h2>
          <p className="text-sm text-red-600 mt-2">Missing booking details. Go back and select a slot again.</p>
          <button
            className="mt-4 px-4 py-2 rounded-md bg-gray-800 text-white text-sm"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-gray-800">Payment</h2>

        <div className="mt-3 text-sm text-gray-700 space-y-1">
          <div><span className="text-gray-500">Doctor:</span> {payload.doctorName || payload.doctorId}</div>
          <div><span className="text-gray-500">Date:</span> {payload.date}</div>
          <div><span className="text-gray-500">Time:</span> {payload.time}</div>
          <div><span className="text-gray-500">Mode:</span> {payload.type}</div>
          <div><span className="text-gray-500">Fee:</span> ₹{Number(payload.fee || 0)}</div>
        </div>

        {status === 'processing' && (
          <p className="mt-4 text-sm text-gray-600">
            Processing payment... please wait {seconds}s
          </p>
        )}

        {status === 'success' && (
          <p className="mt-4 text-sm text-green-700">
            Payment successful. Booking confirmed.
          </p>
        )}

        {status === 'error' && (
          <>
            <p className="mt-4 text-sm text-red-600">{error}</p>
            <button
              className="mt-4 px-4 py-2 rounded-md bg-gray-800 text-white text-sm"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Payment
