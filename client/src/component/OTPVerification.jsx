import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const RESEND_TIMER_SECONDS = 30;

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const fallback = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('pendingOtpVerification') || '{}');
    } catch {
      return {};
    }
  }, []);

  const initialRole = location.state?.role || fallback.role || 'patient';
  const initialEmail = location.state?.email || fallback.email || '';

  const role = initialRole;
  const email = initialEmail;
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_TIMER_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const getBasePath = () => (role === 'doctor' ? 'doctors' : 'patients');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !otp) {
      setError('Please enter email and OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/${getBasePath()}/register/verify-otp`,
        { email, otp }
      );

      if (!response.data?.success) {
        setError(response.data?.message || 'OTP verification failed');
        return;
      }

      sessionStorage.removeItem('pendingOtpVerification');
      setSuccessMsg('Registration completed successfully! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || secondsLeft > 0) return;

    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/${getBasePath()}/register/resend-otp`,
        { email }
      );

      if (!response.data?.success) {
        setError(response.data?.message || 'Failed to resend OTP');
        return;
      }

      setSecondsLeft(RESEND_TIMER_SECONDS);
      setSuccessMsg('OTP resent to your email');
      setOtp('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const isDoctorRole = role === 'doctor';
  const bgClass = isDoctorRole 
    ? 'from-rose-50/70 via-white to-orange-50/60'
    : 'from-teal-50/70 via-white to-cyan-50/60';
  const textColorClass = isDoctorRole ? 'text-rose-600' : 'text-teal-600';
  const accentBg = isDoctorRole ? 'bg-rose-50' : 'bg-teal-50';
  const accentBorder = isDoctorRole ? 'border-rose-100' : 'border-teal-100';
  const focusRing = isDoctorRole ? 'focus:ring-rose-200 focus:border-rose-400' : 'focus:ring-teal-200 focus:border-teal-400';
  const buttonPrimary = isDoctorRole
    ? 'bg-rose-600 hover:bg-rose-700'
    : 'bg-teal-600 hover:bg-teal-700';
  const buttonSecondary = isDoctorRole
    ? 'border-rose-600 text-rose-700 hover:bg-rose-50'
    : 'border-teal-600 text-teal-700 hover:bg-teal-50';
  const iconColor = isDoctorRole ? 'text-rose-500' : 'text-teal-500';
  const helperLinkColor = isDoctorRole ? 'text-rose-600 hover:text-rose-700' : 'text-teal-600 hover:text-teal-700';

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50">
      <Navbar />
      
      <div className={`flex-1 bg-gradient-to-b ${bgClass} flex items-center justify-center px-4 pt-20 sm:pt-24 pb-4 sm:pb-6 md:pb-8 overflow-y-auto`}>
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Card */}
          <div className={`bg-white/95 rounded-2xl shadow-lg border ${accentBorder} p-5 sm:p-6 backdrop-blur-sm`}>
            
            {/* Header */}
            <div className="text-center mb-4 sm:mb-5">
              <div className={`w-11 sm:w-12 h-11 sm:h-12 rounded-xl ${accentBg} flex items-center justify-center mx-auto mb-3`}>
                <svg className={`w-6 sm:w-7 h-6 sm:h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-[1.8rem] font-bold text-slate-900">Email Verification</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                We have sent a 6-digit OTP to your email.
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-1.5 break-all">
                {email || 'Email not found. Please go back and register again.'}
              </p>
              <p className={`text-sm font-medium mt-2 ${textColorClass}`}>
                {isDoctorRole ? '👨‍⚕️ Registering as Doctor' : '👤 Registering as Patient'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800 flex items-start gap-2">
                  <span className="text-lg">✅</span>
                  {successMsg}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleVerify} className="space-y-3.5">
              
              {/* OTP Input */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className={`w-full border border-gray-300 rounded-xl px-3 py-2 tracking-[0.2em] text-center text-xl sm:text-2xl font-bold focus:outline-none focus:ring-2 ${focusRing} transition duration-150 bg-white`}
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">6-digit code</p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${buttonPrimary} text-white py-2.5 rounded-xl font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </button>

              {/* Resend Button */}
              <button
                type="button"
                onClick={handleResend}
                disabled={secondsLeft > 0 || resending}
                className={`w-full border-2 ${buttonSecondary} py-2.5 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80`}
              >
                {resending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </span>
                ) : secondsLeft > 0 ? (
                  <span>Resend OTP in <strong>{secondsLeft}s</strong></span>
                ) : (
                  'Resend OTP'
                )}
              </button>
            </form>

            {/* Email Correction Help */}
            <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">Email incorrect?</span>{' '}
              <button
                type="button"
                onClick={() => {
                  const savedData = sessionStorage.getItem('registrationFormData');
                  if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    if (role === 'patient') {
                      navigate('/register/patient', { state: { formData: parsedData } });
                    } else {
                      navigate('/register/doctor', { state: { formData: parsedData } });
                    }
                  } else {
                    navigate(role === 'patient' ? '/register/patient' : '/register/doctor');
                  }
                }}
                className={`${helperLinkColor} hover:underline font-medium transition`}
              >
                Go back to correct email
              </button>
              {'. '}Also check your spam or promotions folder if you don't see the OTP email.
            </p>
          </div>

          {/* Login Link */}
          <p className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/')}
              className={`${textColorClass} font-semibold hover:underline transition`}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OTPVerification;
