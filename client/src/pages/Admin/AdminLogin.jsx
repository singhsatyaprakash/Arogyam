import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaSignInAlt, FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.altKey && !e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        const targetPath = location.pathname.startsWith("/admin") ? "/" : "/admin/login";
        navigate(targetPath);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate, location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admins/login`, {
        email,
        password
      });

      if (!response?.data?.success) {
        alert(response?.data?.message || "Admin login failed");
        return;
      }

      localStorage.setItem("adminToken", response.data.data.token);
      localStorage.setItem("role", "admin");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      alert(error?.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl border border-rose-100 shadow-2xl p-7 sm:p-8 relative z-10">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <FaUserShield className="text-xl" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center">Admin Login</h1>
          <p className="text-sm text-gray-500 text-center mt-2 mb-6">
            Authorized administrators only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-500">
                <FaEnvelope className="text-gray-400 mr-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-sm"
                  placeholder="admin@arogyam.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-200 focus-within:border-rose-500">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none text-sm"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/forgot-password", { state: { email } })}
              className="text-sm text-rose-600 hover:text-rose-700 hover:underline text-left"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <FaSignInAlt />
              {loading ? "Signing in..." : "Login as Admin"}
            </button>
          </form>
      </div>
    </div>
  );
};

export default AdminLogin;
