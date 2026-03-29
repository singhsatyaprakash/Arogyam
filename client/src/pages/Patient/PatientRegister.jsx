import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PatientRegisterNavbar from "./PatientRegisterNavbar";
import PatientFooter from "../../patientComponent/PatientFooter";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaLock, FaHeartbeat } from "react-icons/fa";
import axios from "axios";
import Footer from "../../component/Footer";

const PatientRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const navigate = useNavigate();

  const getAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return '';
    const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }

    return age >= 0 ? String(age) : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'birthDate') {
      setForm((prev) => ({
        ...prev,
        birthDate: value,
        age: getAgeFromBirthDate(value),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response=await axios.post(`${import.meta.env.VITE_API_URL}/patients/register`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
        password: form.password
      });
       if (!response.data?.success) {
        alert(response.data?.message || 'Registration failed');
        return;
      }
      alert('Registration successful! Please log in.');

      navigate("/");
    } catch (err) {
      console.error('Register error', err);
      alert('Registration error');
    }
  };

  return (
    <>
      <PatientRegisterNavbar />

      <main className="min-h-screen bg-gradient-to-b from-emerald-50/80 via-white to-cyan-50/50 flex flex-col pt-16">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[0.95fr_1.25fr] gap-6">
            {/* Left - Branding / Benefits */}
            <section className="hidden md:flex flex-col justify-center gap-6 bg-white/95 rounded-2xl border border-emerald-100 shadow-sm p-8 backdrop-blur">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <FaHeartbeat className="text-emerald-700" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
                    Aro<span className="text-emerald-600">gyam</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-2">Welcome to your care journey</p>
              </div>
              <p className="text-gray-600">
                Quick and secure access to trusted doctors. Create your patient account to book appointments, chat with your doctor, and manage health records.
              </p>

              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Book video or in-person appointments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Secure chat with your care team</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Store your medical history safely</span>
                </li>
              </ul>

              <div className="mt-auto text-sm text-gray-500">
                Already registered? <Link to="/" className="text-emerald-700 font-medium hover:underline">Sign in</Link>
              </div>
            </section>

            {/* Right - Form */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1 text-center md:text-left">Create your Patient Account</h2>
              <p className="text-sm text-gray-500 mb-6 text-center md:text-left">Register to book appointments and chat with doctors</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="w-full">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaUser className="text-emerald-500" /> Full Name</div>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400" placeholder="Your full name" />
                  </label>

                  <label className="w-full">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaEnvelope className="text-emerald-500" /> Email</div>
                    <input name="email" value={form.email} onChange={handleChange} type="email" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400" placeholder="you@example.com" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaPhone className="text-emerald-500" /> Phone</div>
                    <input name="phone" value={form.phone} onChange={handleChange} type="tel" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400" placeholder="+1 (555) 123-4567" />
                  </label>

                  <label>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaBirthdayCake className="text-emerald-500" /> Age</div>
                    <input
                      name="age"
                      value={form.age}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                      placeholder="Auto-calculated"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaUser className="text-emerald-500" /> Gender</div>
                    <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <label>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaBirthdayCake className="text-emerald-500" /> Birth Date</div>
                    <input
                      name="birthDate"
                      value={form.birthDate}
                      onChange={handleChange}
                      type="date"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaLock className="text-emerald-500" /> Password</label>
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Create a password"
                    required
                    onFocus={() => setShowPasswordRules(true)}
                    onBlur={() => setShowPasswordRules(false)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                  />
                  {showPasswordRules && (
                    <ul className="mt-2 text-xs text-gray-500 list-disc list-inside bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <li>At least 8 characters</li>
                      <li>Include letters and numbers</li>
                      <li>Avoid common passwords</li>
                    </ul>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaLock className="text-emerald-500" /> Confirm Password</label>
                  <input
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="Confirm password"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition mt-2 shadow-sm">
                  Create Account
                </button>

                <div className="text-center text-sm text-gray-500">
                  By creating an account you agree to our <Link to="/terms" className="text-emerald-700 hover:underline">Terms</Link> and <Link to="/privacy" className="text-emerald-700 hover:underline">Privacy Policy</Link>.
                </div>
              </form>
            </section>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default PatientRegister;
