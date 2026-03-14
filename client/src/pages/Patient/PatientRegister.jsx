import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PatientRegisterNavbar from "./PatientRegisterNavbar";
import PatientFooter from "../../patientComponent/PatientFooter";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaLock, FaCheckCircle } from "react-icons/fa";
import axios from "axios";

const PatientRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      console.log(response.data);
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

      <main className="min-h-screen bg-green-50 flex flex-col pt-16">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left - Branding / Benefits */}
            <section className="hidden md:flex flex-col justify-center gap-6 bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Welcome to DocConnect</h3>
              </div>
              <p className="text-gray-600">
                Quick and secure access to trusted doctors. Create your patient account to book appointments, chat with your doctor, and manage health records.
              </p>

              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Book video or in-person appointments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Secure chat with your care team</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Store your medical history safely</span>
                </li>
              </ul>

              <div className="mt-auto text-sm text-gray-500">
                Already registered? <Link to="/" className="text-green-600 font-medium hover:underline">Sign in</Link>
              </div>
            </section>

            {/* Right - Form */}
            <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center md:text-left">Create your Patient Account</h2>
              <p className="text-sm text-gray-500 mb-6 text-center md:text-left">Register to book appointments and chat with doctors</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="w-full">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaUser className="text-green-500" /> Full Name</div>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400" placeholder="Your full name" />
                  </label>

                  <label className="w-full">
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaEnvelope className="text-green-500" /> Email</div>
                    <input name="email" value={form.email} onChange={handleChange} type="email" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400" placeholder="you@example.com" />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaPhone className="text-green-500" /> Phone</div>
                    <input name="phone" value={form.phone} onChange={handleChange} type="tel" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400" placeholder="+1 (555) 123-4567" />
                  </label>

                  <label>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaBirthdayCake className="text-green-500" /> Age</div>
                    <input name="age" value={form.age} onChange={handleChange} type="number" min="0" required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400" placeholder="Age" />
                  </label>
                </div>

                <div>
                  <label>
                    <div className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaUser className="text-green-500" /> Gender</div>
                    <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400 bg-white">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaLock className="text-green-500" /> Password</label>
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Create a password"
                    required
                    onFocus={() => setShowPasswordRules(true)}
                    onBlur={() => setShowPasswordRules(false)}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
                  />
                  {showPasswordRules && (
                    <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>Include letters and numbers</li>
                      <li>Avoid common passwords</li>
                    </ul>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 flex items-center gap-2"><FaLock className="text-green-500" /> Confirm Password</label>
                  <input
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="Confirm password"
                    required
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition mt-2">
                  Create Account
                </button>

                <div className="text-center text-sm text-gray-500">
                  By creating an account you agree to our <Link to="/terms" className="text-green-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>.
                </div>
              </form>
            </section>
          </div>
        </div>

        <PatientFooter />
      </main>
    </>
  );
};

export default PatientRegister;
