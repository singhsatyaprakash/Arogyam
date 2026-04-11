import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa";

const AdminForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = useMemo(() => String(location.state?.email || "").trim(), [location.state]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your admin email");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admins/forgot-password/send-otp`, {
        email: email.trim().toLowerCase()
      });

      if (!response.data?.success) {
        setError(response.data?.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setMessage(response.data?.message || "OTP sent to your email");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !otp.trim() || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admins/forgot-password/reset`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword
      });

      if (!response.data?.success) {
        setError(response.data?.message || "Failed to reset password");
        return;
      }

      setMessage("Password updated successfully. Redirecting to admin login...");
      setTimeout(() => navigate("/admin/login", { replace: true }), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-rose-100 p-6 sm:p-8 relative z-10">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold bg-rose-100 text-rose-700 border-rose-200">
            <FaUserShield />
            Admin Recovery
          </div>
          <h2 className="text-2xl sm:text-[1.75rem] font-bold text-center text-gray-900 tracking-tight mt-3">Forgot Password</h2>
          <p className="text-sm text-gray-500 text-center mt-1">Reset your admin account with OTP verification</p>
        </div>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {message && <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{message}</div>}

        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Admin Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-500">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@arogyam.com"
                className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2 rounded-xl text-white font-bold transition shadow-sm bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP to Email"}
            </button>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500 text-sm tracking-[0.2em] text-center font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">New Password</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-500">
                  <FaLock className="text-gray-400 mr-3" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Confirm Password</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-500">
                  <FaLock className="text-gray-400 mr-3" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-xl text-white font-bold transition shadow-sm bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-2 rounded-xl border border-rose-300 text-rose-700 font-semibold transition hover:bg-rose-50"
              >
                Resend OTP
              </button>
            </>
          )}
        </form>

        <button
          type="button"
          onClick={() => navigate("/admin/login")}
          className="w-full mt-4 text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
        >
          Back to Admin Login
        </button>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
