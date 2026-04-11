import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PatientContext } from "../contexts/PatientContext";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { FaLock } from "react-icons/fa";
import axios from "axios";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const ChatPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const { patient } = useContext(PatientContext);

  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [statusText, setStatusText] = useState("Creating payment order...");

  // Prevent multiple API calls
  const hasProcessed = useRef(false);
  const paymentCompletedRef = useRef(false);
  const redirectTimeoutRef = useRef(null);

  const processPayment = useCallback(async () => {
    //Stop duplicate calls
    if (hasProcessed.current || paymentCompletedRef.current) return;
    hasProcessed.current = true;

    try {
      setProcessing(true);
      setError(null);
      setStatusText("Loading Razorpay checkout...");

      const patientId = patient?.patient?._id || patient?._id;
      if (!patientId) {
        throw new Error("Patient session missing");
      }

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error("Unable to load Razorpay checkout");
      }

      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/appointments/create-razorpay-order`, {
        bookingType: "chat",
        type: "chat",
        doctorId: bookingData.doctorId,
        patientId,
      });

      if (!orderRes?.data?.success) {
        throw new Error(orderRes?.data?.message || "Unable to create payment order");
      }

      const { keyId, orderId, amount, currency } = orderRes.data.data;
      setStatusText("Opening payment gateway...");

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "Arogyam",
        description: "Chat Consultation Payment",
        order_id: orderId,
        prefill: {
          email: patient?.patient?.email || patient?.email || "",
          name: patient?.patient?.name || patient?.name || "",
        },
        handler: async function (response) {
          try {
            if (paymentCompletedRef.current) return;

            setStatusText("Verifying payment...");
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_API_URL}/appointments/verify-razorpay-payment`,
              response
            );

            if (paymentCompletedRef.current) return;

            if (!verifyRes?.data?.success) {
              throw new Error(verifyRes?.data?.message || "Payment verification failed");
            }

            paymentCompletedRef.current = true;
            setSuccess(true);
            setProcessing(false);
            setError(null);

            redirectTimeoutRef.current = window.setTimeout(() => {
              navigate("/patient/chats", {
                replace: true,
                state: { newConnection: verifyRes?.data?.data?.chatConnection || null },
              });
            }, 600);
          } catch (verifyError) {
            if (paymentCompletedRef.current) return;

            setError(verifyError?.response?.data?.message || verifyError?.message || "Payment verification failed");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (paymentCompletedRef.current) return;

            setError("Payment was cancelled. Please try again.");
            setProcessing(false);
          },
        },
        theme: {
          color: "#16a34a",
        },
      });

      razorpay.open();
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(
        err.response?.data?.message || err.message || "Payment processing failed"
      );
      setProcessing(false);
    }
  }, [bookingData, navigate, patient]);

  useEffect(() => {
    if (!bookingData) {
      navigate("/patient/appointments");
      return;
    }

    processPayment();

    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [bookingData, navigate, processPayment]);

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
          {processing && (
            <div>
              <Loader2 className="w-16 h-16 animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                Processing Payment...
              </p>
              <p className="text-sm text-gray-500">{statusText}</p>
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
              Secure payment powered by Razorpay
            </p>
            <p>Your session will be active for 10 days</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPayment;