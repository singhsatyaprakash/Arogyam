import { useState, useRef } from "react";
import DoctorRegisterNavbar from "../../doctorComponent/DoctorRegisterNavbar";
import DoctorPreviewModal from "../../doctorComponent/DoctorPreviewModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorRegister = () => {
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    title: "Dr.",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    experience: "",
    qualifications: "",
    languages: "",
    chatFee: "",
    voiceFee: "",
    videoFee: "",
    fromTime: "",
    toTime: "",
  });
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "confirmPassword" || name === "password") {
      setPasswordError("");
    }
  };

  const titleOptions = [
    { value: "Dr.", label: "Dr. (Doctor)" },
    { value: "Prof.", label: "Prof. (Professor)" },
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Ms.", label: "Ms." },
    { value: "Miss", label: "Miss" },
  ];

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match!");
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters!");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting:", formData);

      const nameWithTitle = `${formData.title} ${formData.name}`;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/doctors/register`,
        {
          ...formData,
          name: nameWithTitle,
          experience: Number(formData.experience),
          chatFee: Number(formData.chatFee),
          voiceFee: Number(formData.voiceFee),
          videoFee: Number(formData.videoFee),
        }
      );

      console.log("Success:", res.data);
      alert("Registration successful!");
      //navigate("/verify-email", { state: { email: formData.email } }); 
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (nextStep) => {
    // Validate passwords when moving from step 1 to step 2
    if (step === 1 && nextStep === 2) {
      if (!validatePasswords()) {
        return;
      }
    }
    // Validates only currently-rendered inputs (since other steps are not in the DOM)
    const ok = formRef.current?.reportValidity?.() ?? true;
    if (ok) setStep(nextStep);
  };

  const input =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-150 bg-white/95";
  
  return (
    <>
      <DoctorRegisterNavbar />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 pt-24 pb-8">
        <div className="bg-white/95 w-full max-w-xl rounded-2xl shadow-xl p-6 border border-gray-100 backdrop-blur-sm">
          
          {/* HEADER */}
          <div className="flex items-center justify-center mb-4">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 mr-3 shadow-md" />
            <h2 className="text-3xl font-bold text-center text-gray-800">
              Join Our Medical Network
            </h2>
          </div>
          <p className="text-gray-600 text-center mb-6 text-sm font-medium">
            Complete your profile to start consulting patients online
          </p>

          {/* STEPPER */}
          <div className="relative flex justify-between items-center mb-6">
            <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200" />
            <div
              className="absolute top-4 left-0 h-[2px] bg-red-500 transition-all"
              style={{
                width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
              }}
            />

            {["Account", "Professional", "Availability"].map((label, i) => {
              const n = i + 1;
              return (
                <div key={n} className="relative flex flex-col items-center w-1/3">
                  <div
                    className={`w-7 h-7 rounded-full border-2 bg-white flex items-center justify-center text-sm font-semibold z-10 ${
                      step >= n
                        ? "border-red-500 text-red-500"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {n}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      step === n ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* FORM */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800 block mb-2">Title</label>
                  <select 
                    required 
                    name="title" 
                    value={formData.title} 
                    className={input + " cursor-pointer"}
                    onChange={handleChange}
                  >
                    {titleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">This will appear before your name</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800">Full Name</label>
                  <input required name="name" value={formData.name} placeholder="Enter your full name" className={input} onChange={handleChange} />
                  {formData.name && (
                    <p className="text-xs text-green-600 mt-2 font-medium">Preview: {formData.title} {formData.name}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800">Email</label>
                  <input required name="email" type="email" value={formData.email} placeholder="your@email.com" className={input} onChange={handleChange} />
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800">Phone</label>
                  <input required name="phone" value={formData.phone} placeholder="10-digit phone number" className={input} onChange={handleChange} />
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800">Password</label>
                  <input required name="password" type="password" value={formData.password} placeholder="Minimum 6 characters" className={input} onChange={handleChange} />
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800">Confirm Password</label>
                  <input required name="confirmPassword" type="password" value={formData.confirmPassword} placeholder="Re-enter your password" className={input} onChange={handleChange} />
                  {passwordError && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {passwordError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transform transition-all duration-200 shadow-md mt-4 flex items-center justify-center gap-2"
                >
                  <span>Continue to Professional Info</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800 block mb-2">Specialization</label>
                  <input required name="specialization" placeholder="e.g., Cardiology, Neurology" value={formData.specialization} className={input} onChange={handleChange} />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800 block mb-2">Experience (Years)</label>
                  <input required type="number" min="0" max="70" name="experience" placeholder="Enter years of experience" value={formData.experience} className={input} onChange={handleChange} />
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800 block mb-2">Qualifications</label>
                  <input required name="qualifications" placeholder="e.g., MBBS, MD, DNB" value={formData.qualifications} className={input} onChange={handleChange} />
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
                  <label className="text-sm font-semibold text-gray-800 block mb-2">Languages</label>
                  <input required name="languages" placeholder="e.g., English, Hindi, Tamil" value={formData.languages} className={input} onChange={handleChange} />
                </div>

                <div className="flex justify-between gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-gray-300 px-4 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition duration-200 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transform transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Continue to Availability</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Consultation Fees (₹)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border-2 border-emerald-200">
                      <label className="text-xs font-medium text-gray-600 block mb-2">Chat</label>
                      <input required name="chatFee" type="number" min="0" placeholder="Chat" value={formData.chatFee} className={input} onChange={handleChange} />
                    </div>
                    <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
                      <label className="text-xs font-medium text-gray-600 block mb-2">Voice</label>
                      <input required name="voiceFee" type="number" min="0" placeholder="Voice" value={formData.voiceFee} className={input} onChange={handleChange} />
                    </div>
                    <div className="bg-white rounded-lg p-3 border-2 border-purple-200">
                      <label className="text-xs font-medium text-gray-600 block mb-2">Video</label>
                      <input required name="videoFee" type="number" min="0" placeholder="Video" value={formData.videoFee} className={input} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Availability (24-hour format)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                      <label className="text-xs font-medium text-gray-600 block mb-2">From Time</label>
                      <input
                        required
                        type="time"
                        lang="en-GB"
                        step={900}
                        name="fromTime"
                        aria-label="From time (24-hour)"
                        value={formData.fromTime}
                        className={input}
                        onChange={handleChange}
                        max={formData.toTime || undefined}
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border-2 border-yellow-200">
                      <label className="text-xs font-medium text-gray-600 block mb-2">To Time</label>
                      <input
                        required
                        type="time"
                        lang="en-GB"
                        step={900}
                        name="toTime"
                        aria-label="To time (24-hour)"
                        value={formData.toTime}
                        className={input}
                        onChange={handleChange}
                        min={formData.fromTime || undefined}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 bg-amber-50 border-l-4 border-amber-400 p-3 rounded mb-4">
                  <strong>Example:</strong> From 09:30 to 17:45
                </p>

                <div className="flex justify-between gap-3 mt-4 items-center">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 border-2 border-gray-300 px-4 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition duration-200 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Ensure required fields + 24h time format are valid before preview
                      if (formRef.current?.reportValidity?.()) setShowPreview(true);
                    }}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276a1 1 0 010 1.788L15 12v-2zM4 6v12a2 2 0 002 2h12" />
                    </svg>
                    <span>Preview</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-60 shadow-lg hover:shadow-xl disabled:cursor-not-allowed hover:scale-[1.01] transform transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-xs text-center text-gray-500 mt-6">
            By registering, you agree to our{" "}
            <span className="text-red-500 cursor-pointer">Terms</span> &{" "}
            <span className="text-red-500 cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>

      {showPreview && (
        <DoctorPreviewModal
          data={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default DoctorRegister;
