import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/homeBackground.webp";
import { FaHeartbeat, FaUserInjured, FaUserMd, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus} from "react-icons/fa";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import axios from "axios";
import { DoctorContext } from "../contexts/DoctorContext";
import { PatientContext } from "../contexts/PatientContext";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(() => {
    const storedRole = localStorage.getItem("role");
    return storedRole === "doctor" ? "doctor" : "patient";
  });
  const [showPassword, setShowPassword] = useState(false);
  const { setDoctor } = useContext(DoctorContext);
  const { setPatient } = useContext(PatientContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const rolePrimaryClass =
    role === "patient"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-rose-600 hover:bg-rose-700";
  const roleFocusClass =
    role === "patient"
      ? "focus-within:ring-emerald-200 focus-within:border-emerald-500"
      : "focus-within:ring-rose-200 focus-within:border-rose-500";

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("roleChange", { detail: role }));
  }, [role]);

  useEffect(() => {
    const message = location.state?.authMessage;
    if (message) {
      alert(message);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

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

  useEffect(() => {
    let isMounted = true;

    const isUsableToken = (value) => {
      if (!value || typeof value !== "string") return false;
      const token = value.trim();
      if (!token || token === "undefined" || token === "null") return false;
      // Basic JWT shape check to avoid noisy validate calls with corrupted values.
      return token.split(".").length === 3;
    };

    const clearAuth = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("doctorToken");
      localStorage.removeItem("role");
      if (!isMounted) return;
      setDoctor(null);
      setPatient(null);
    };

    const validateExistingSession = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("doctorToken");
      const storedRole = localStorage.getItem("role");

      if (storedRole !== "patient" && storedRole !== "doctor") {
        return;
      }

      if (!isUsableToken(token)) {
        clearAuth();
        return;
      }

      try {
        const endpoint = storedRole === "patient" ? "patients/validate" : "doctors/validate";
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted || !response?.data?.success) {
          return;
        }

        if (storedRole === "patient") {
          setPatient({ patient: response.data?.data?.patient, token });
          navigate("/patient/dashboard", { replace: true });
          return;
        }

        setDoctor({ doctor: response.data?.data?.doctor, token });
        navigate("/doctor/dashboard", { replace: true });
      } catch {
        clearAuth();
      }
    };

    validateExistingSession();

    return () => {
      isMounted = false;
    };
  }, [navigate, setDoctor, setPatient]);

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = role === "patient" ? "patients" : "doctors";
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/${endpoint}/login`, {
        email: formData.email,
        password: formData.password,
      });
      const data = response.data;
      if (!data?.success) {
        alert(data?.message || "Login failed");
        return;
      }
      const token = data.data?.token;
      if (!token) {
        alert("No token received");
        return;
      }
      else{
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
      }
      // Update context based on role
      if (role === "patient") {
        setPatient({ ...data.data, token });
      } else {
        setDoctor({ ...data.data, token });
      }
      // console.log(patient, doctor);
      navigate(`/${role}/dashboard`, { replace: true });
    }
    catch (err) {
      const msg = err?.response?.data?.message || "Login error";
      alert(msg);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="pt-20 min-h-screen bg-cover bg-center flex items-center justify-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/80 to-emerald-50/80 backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full max-w-sm bg-white/95 rounded-2xl shadow-2xl border border-gray-200 px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex justify-center mb-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${role === "patient" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              <FaHeartbeat className="text-xl" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 tracking-tight">
            Welcome to Arogyam
          </h2>
          <p className="text-gray-500 text-center mb-5 text-sm">
            Sign in to your account
          </p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-5 border border-gray-200">
            {/*toggle between patient and doctor */}
            <button
              onClick={() => setRole("patient")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                role === "patient"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <FaUserInjured />
              Patient
            </button>
            <button
              onClick={() => setRole("doctor")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                role === "doctor"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white"
              }`}
            >
              <FaUserMd />
              Doctor
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* email input */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Email Address</label>
              <div className={`flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ${roleFocusClass}`}>
                <FaEnvelope className="text-gray-400 mr-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full outline-none text-sm bg-transparent"
                  required
                />
              </div>
            </div>
            {/* password input */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Password
              </label>
              <div className={`flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ${roleFocusClass}`}>
                <FaLock className="text-gray-400 mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full outline-none text-sm bg-transparent"
                  required
                />
                <div
                  onClick={togglePasswordVisibility}
                  className="ml-2 cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/forgot-password', {
                  state: {
                    role,
                    email: formData.email?.trim() || ''
                  }
                })
              }
              className="text-right w-full text-xs text-gray-500 hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>

            <button
              type="submit"
              className={`w-full py-2 rounded-xl text-white font-bold transition shadow-sm flex items-center justify-center gap-2 ${rolePrimaryClass}`}
            >
              <FaSignInAlt />
              Sign In as {role === "patient" ? "Patient" : "Doctor"}
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 my-5 uppercase tracking-widest">
            OR
          </div>

          <button
            onClick={() => navigate("/register/patient")}
            className={`w-full mb-2 py-2 rounded-xl border font-semibold transition flex items-center justify-center gap-2 ${role === "patient" ? "border-emerald-500 text-emerald-700 hover:bg-emerald-50" : "border-emerald-400 text-emerald-700 hover:bg-emerald-50"}`}
          >
            <FaUserPlus />
            Sign up as Patient
          </button>

          <button
            onClick={() => navigate("/register/doctor")}
            className="w-full py-2 rounded-xl border border-rose-500 text-rose-700 font-semibold transition flex items-center justify-center gap-2 hover:bg-rose-50"
          >
            <FaUserMd />
            Sign up as Doctor
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
