import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PatientContext } from "../contexts/PatientContext";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { FaLock } from "react-icons/fa";
import axios from "axios";

const ChatPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const { patient } = useContext(PatientContext);

  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10);

  // Prevent multiple API calls
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!bookingData) {
      navigate("/patient/appointments");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          processPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingData]);

  const processPayment = async () => {
    //Stop duplicate calls
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    try {
      setProcessing(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chats/new-connection`,
        {
          doctorId: bookingData.doctorId,
          patientId: patient.patient._id,
          fee: bookingData.fee,
          note: bookingData.note || "Chat session started",
        }
      );

      console.log("Payment response:", response.data);

      if (response.data.success) {
        setSuccess(true);
        setProcessing(false);

        setTimeout(() => {
          navigate("/patient/chats", {
            state: { newConnection: response.data.data.connection },
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(
        err.response?.data?.message || err.message || "Payment processing failed"
      );
      setProcessing(false);
    }
  };

  if (!bookingData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Chat Payment Processing
          </h1>
          <p className="text-gray-600">
            Please wait while we process your payment
          </p>
        </div>

        {/* Doctor Info */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {bookingData.doctor?.name?.charAt(0) || "D"}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {bookingData.doctor?.name || "Unknown"}
              </h3>
              <p className="text-sm text-gray-600">
                {bookingData.doctor?.specialization || "General Physician"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Chat Consultation Fee</span>
            <span className="text-2xl font-bold text-green-600">
              ₹{bookingData.fee || 0}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          {processing && countdown > 0 && (
            <div>
              <Loader2 className="w-16 h-16 animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                Processing Payment...
              </p>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {countdown}
              </div>
              <p className="text-sm text-gray-500">seconds remaining</p>
            </div>
          )}

          {processing && countdown === 0 && (
            <div>
              <Loader2 className="w-16 h-16 animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">
                Finalizing your chat session...
              </p>
            </div>
          )}

          {success && (
            <div>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600">Redirecting to your chats...</p>
            </div>
          )}

          {error && (
            <div>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate("/patient/appointments")}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Back to Appointments
              </button>
            </div>
          )}
        </div>

        {/* Note */}
        {processing && (
          <div className="text-center text-xs text-gray-500">
            <p className="inline-flex items-center gap-1">
              <FaLock className="text-gray-500" />
              This is a simulated payment process
            </p>
            <p>Your session will be active for 10 days</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPayment;