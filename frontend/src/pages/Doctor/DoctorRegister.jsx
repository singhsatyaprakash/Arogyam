import { useState, useRef } from "react";
import DoctorRegisterNavbar from "../../doctorComponent/DoctorRegisterNavbar";
import DoctorPreviewModal from "../../doctorComponent/DoctorPreviewModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorRegister = () => {
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting:", formData);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/doctors/register`,
        {
          ...formData,
          experience: Number(formData.experience),
          chatFee: Number(formData.chatFee),
          voiceFee: Number(formData.voiceFee),
          videoFee: Number(formData.videoFee),
        }
      );

      console.log("Success:", res.data);
      alert("Registration successful!");
      navigate("/verify-email", { state: { email: formData.email } }); 
      

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (nextStep) => {
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
            <div className="h-1 w-16 rounded-full bg-red-500 mr-3 shadow-md" />
            <h2 className="text-2xl font-bold text-center">
              Join Our Medical Network
            </h2>
          </div>
          <p className="text-gray-500 text-center mb-6 text-sm">
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
                <label className="text-sm font-medium">Full Name</label>
                <input required name="name" value={formData.name} className={input} onChange={handleChange} />

                <label className="text-sm font-medium mt-3 block">Email</label>
                <input required name="email" type="email" value={formData.email} className={input} onChange={handleChange} />

                <label className="text-sm font-medium mt-3 block">Phone</label>
                <input required name="phone" value={formData.phone} className={input} onChange={handleChange} />

                <label className="text-sm font-medium mt-3 block">Password</label>
                <input required name="password" type="password" value={formData.password} className={input} onChange={handleChange} />

                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-md font-semibold hover:scale-[1.01] transform transition-shadow shadow-sm mt-4 flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <input required name="specialization" placeholder="Specialization" value={formData.specialization} className={input} onChange={handleChange} />
                <input required type="number" name="experience" placeholder="Experience (years)" value={formData.experience} className={input} onChange={handleChange} />
                <input required name="qualifications" placeholder="Qualifications" value={formData.qualifications} className={input} onChange={handleChange} />
                <input required name="languages" placeholder="Languages" value={formData.languages} className={input} onChange={handleChange} />

                <div className="flex justify-between mt-4">
                  <button type="button" onClick={() => setStep(1)} className="border px-4 py-2 rounded flex items-center gap-2 hover:shadow-sm transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded hover:scale-[1.01] transform transition-shadow shadow-sm flex items-center gap-2"
                  >
                    <span>Continue</span>
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
                <div className="grid grid-cols-3 gap-3">
                  <input required name="chatFee" type="number" placeholder="Chat ₹" value={formData.chatFee} className={input} onChange={handleChange} />
                  <input required name="voiceFee" type="number" placeholder="Voice ₹" value={formData.voiceFee} className={input} onChange={handleChange} />
                  <input required name="videoFee" type="number" placeholder="Video ₹" value={formData.videoFee} className={input} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
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

                <p className="text-xs text-gray-500 mt-1">
                  Use 24-hour time (e.g., 09:30, 17:45).
                </p>

                <div className="flex justify-between mt-4 items-center">
                  <button type="button" onClick={() => setStep(2)} className="border px-4 py-2 rounded flex items-center gap-2 hover:shadow-sm transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="bg-amber-400 text-white px-4 py-2 rounded hover:bg-amber-500 shadow-md flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276a1 1 0 010 1.788L15 12v-2zM4 6v12a2 2 0 002 2h12" />
                    </svg>
                    <span>Preview</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded disabled:opacity-60 shadow-md hover:scale-[1.02] transform transition"
                  >
                    {loading ? "Submitting..." : (
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Complete</span>
                      </span>
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
