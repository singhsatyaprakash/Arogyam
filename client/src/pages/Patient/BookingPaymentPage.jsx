import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { usePatientContext } from '../../contexts/PatientContext';

const BookingPaymentPage = ({ doctor, selectedType, selectedDate, selectedTime, onSuccess, onCancel }) => {
  const { API_URL, token, patient } = usePatientContext();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = useMemo(() => {
    const tkn = token || localStorage.getItem('token');
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token]);

  const fee = useMemo(() => {
    const feeMap = {
      chat: doctor?.consultationFee?.chat || 0,
      voice: doctor?.consultationFee?.voice || 0,
      video: doctor?.consultationFee?.video || 0,
      "in-person": (doctor?.consultationFee?.video || 0) + 100
    };
    return feeMap[selectedType] || 0;
  }, [doctor, selectedType]);

  const isChat = selectedType === 'chat';

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const endpoint = isChat ? '/confirm-payment-chat' : '/confirm-payment';
      const payload = isChat
        ? {
            patientId: patient?._id,
            doctorId: doctor?._id,
            type: 'chat'
          }
        : {
            patientId: patient?._id,
            doctorId: doctor?._id,
            date: selectedDate,
            type: selectedType,
            time: selectedTime
          };

      const res = await axios.post(
        `${API_URL}/appointments${endpoint}`,
        payload,
        { headers: { 'Content-Type': 'application/json', ...authHeaders } }
      );

      if (res?.data?.success) {
        onSuccess?.(res.data.data);
      } else {
        setError(res?.data?.message || 'Payment failed');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Payment error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-lg font-semibold text-gray-900">Confirm {isChat ? 'Chat' : 'Appointment'}</h2>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Doctor</span>
              <span className="font-medium">{doctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-medium capitalize">{selectedType}</span>
            </div>
            {!isChat && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </>
            )}
            {isChat && (
              <div className="text-xs text-gray-500 italic">
                Chat access for 10 days
              </div>
            )}
            <div className="border-t pt-3 flex justify-between text-base font-semibold">
              <span>Fee</span>
              <span className="text-green-600">₹{fee}</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 font-medium"
          >
            {processing ? 'Processing...' : `Pay ₹${fee}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentPage;
