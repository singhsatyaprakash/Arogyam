import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientContext from '../contexts/PatientContext';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

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

  const [status, setStatus] = useState('idle'); // idle | creating-order | opening-gateway | verifying | success | error
  const [error, setError] = useState('');

  const canStart = Boolean(payload?.doctorId && payload?.patientId && payload?.date && payload?.type && payload?.time);

  useEffect(() => {
    if (!canStart) return;

    setStatus('creating-order');
    setError('');

    let cancelled = false;

    const startPayment = async () => {
      try {
        const scriptReady = await loadRazorpayScript();
        if (!scriptReady) {
          throw new Error('Unable to load Razorpay checkout');
        }

        const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/appointments/create-razorpay-order`, {
          bookingType: 'appointment',
          doctorId: payload.doctorId,
          patientId: payload.patientId,
          date: payload.date,
          type: payload.type,
          time: payload.time,
        });

        if (cancelled) return;
        if (!orderRes?.data?.success) {
          throw new Error(orderRes?.data?.message || 'Unable to create payment order');
        }

        const { keyId, orderId, amount, currency } = orderRes.data.data;
        setStatus('opening-gateway');

        const razorpay = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          name: 'Arogyam',
          description: 'Appointment Payment',
          order_id: orderId,
          prefill: {
            email: patient?.email || patient?.patient?.email || '',
            name: patient?.name || patient?.patient?.name || '',
          },
          handler: async function (response) {
            try {
              setStatus('verifying');
              const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL}/appointments/verify-razorpay-payment`, response);
              if (!verifyRes?.data?.success) {
                throw new Error(verifyRes?.data?.message || 'Payment verification failed');
              }
              setStatus('success');
              setTimeout(() => navigate('/patient/booked-appointment'), 1000);
            } catch (verifyError) {
              setStatus('error');
              setError(verifyError?.response?.data?.message || verifyError?.message || 'Payment verification failed');
            }
          },
          modal: {
            ondismiss: () => {
              setStatus('error');
              setError('Payment was cancelled. Please try again.');
            },
          },
          theme: {
            color: '#059669',
          },
        });

        razorpay.open();
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setError(e?.response?.data?.message || e?.message || 'Unable to start payment');
      }
    };

    startPayment();

    return () => {
      cancelled = true;
    };
  }, [canStart, navigate, payload, patient]);

  if (!canStart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-6">
        <div className="bg-white/95 border border-rose-100 rounded-2xl shadow-md p-7 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          <p className="text-sm text-rose-700 mt-2">Missing booking details. Go back and select a slot again.</p>
          <button
            className="mt-5 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white/95 shadow-lg backdrop-blur overflow-hidden">
        <div className="px-6 sm:px-7 pt-7 pb-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <h2 className="text-2xl font-bold tracking-tight">Payment Checkout</h2>
          <p className="text-sm text-emerald-50 mt-1">Securely confirming your appointment booking</p>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5 text-sm text-gray-700 space-y-2">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Doctor</span>
              <span className="font-medium text-gray-900 text-right">{payload.doctorName || payload.doctorId}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900 text-right">{payload.date}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900 text-right">{payload.time}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Consultation Type</span>
              <span className="font-medium text-gray-900 text-right capitalize">{payload.type}</span>
            </div>
            <div className="my-2 border-t border-dashed border-gray-300" />
            <div className="flex justify-between gap-3">
              <span className="text-gray-600 font-medium">Amount</span>
              <span className="text-lg font-bold text-emerald-700">₹{Number(payload.fee || 0)}</span>
            </div>
          </div>

        {status === 'creating-order' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-900 font-medium">Creating secure payment order...</p>
          </div>
        )}

        {status === 'opening-gateway' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-900 font-medium">Opening Razorpay checkout...</p>
          </div>
        )}

        {status === 'verifying' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm text-emerald-900 font-medium">Verifying payment and confirming booking...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-800 font-medium">Payment successful. Booking confirmed.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-700 font-medium">{error}</p>
            <button
              className="mt-4 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>
          </div>
        )}

          {(status === 'creating-order' || status === 'opening-gateway' || status === 'verifying') && (
            <p className="text-xs text-gray-500 text-center">
              Please do not refresh or close this page while payment is being confirmed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
