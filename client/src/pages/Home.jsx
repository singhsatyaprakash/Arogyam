import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/homeBackground.webp";
import { FaHeartbeat, FaUserInjured, FaUserMd, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus} from "react-icons/fa";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import axios from "axios";
import { DoctorContext } from "../contexts/DoctorContext";
import { PatientContext } from "../contexts/PatientContext";

const Home = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [showPassword, setShowPassword] = useState(false);
  const { doctor, setDoctor } = useContext(DoctorContext);
  const { patient, setPatient } = useContext(PatientContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    localStorage.setItem("role", role);
    window.dispatchEvent(new CustomEvent("roleChange", { detail: role }));
  }, [role]);

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
        className="pt-20 bg-cover bg-center flex items-center justify-center relative opacity-95"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>

        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaHeartbeat className="text-xl text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-center mb-5 text-sm">
            Sign in to your account
          </p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {/*toggle between patient and doctor */}
            <button
              onClick={() => setRole("patient")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                role === "patient"
                  ? "bg-green-500 text-white shadow-md"
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
                  ? "bg-red-500 text-white shadow-md"
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
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400">
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
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400">
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

            <div className="text-right text-xs text-gray-500 hover:underline cursor-pointer">
              Forgot Password?
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded-xl text-white font-bold transition shadow-md flex items-center justify-center gap-2 ${
                role === "patient"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
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
            className="w-full mb-2 py-2 rounded-xl border border-green-500 text-green-600 font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2"
          >
            <FaUserPlus />
            Sign up as Patient
          </button>

          <button
            onClick={() => navigate("/register/doctor")}
            className="w-full py-2 rounded-xl border border-red-500 text-red-600 font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
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
