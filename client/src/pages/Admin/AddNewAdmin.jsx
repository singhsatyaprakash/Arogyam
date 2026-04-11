import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaEnvelope, FaPaperPlane, FaPlusCircle, FaTimes, FaUserShield } from "react-icons/fa";

const AddNewAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (!showSuccessPopup) return undefined;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setShowSuccessPopup(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSuccessPopup]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Admin session missing. Please login again.");
        navigate("/admin/login");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admins/create`,
        {
          name: formData.name,
          email: formData.email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to create admin");
      }

      setFormData({ name: "", email: "" });
      setShowSuccessPopup(true);
    } catch (error) {
      alert(error?.response?.data?.message || error?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 px-4 py-8 relative overflow-hidden">
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
      <div className="max-w-3xl mx-auto py-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-rose-100 shadow-2xl p-8 relative z-10">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-5"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FaUserShield />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Admin</h1>
              <p className="text-sm text-gray-600">Enter name and email to send new admin credentials.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                placeholder="New admin full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-500">
                <FaEnvelope className="text-gray-400 mr-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className="w-full outline-none"
                  placeholder="new-admin@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <FaPaperPlane />
              {loading ? "Sending Credentials..." : "Create Admin and Send Credentials"}
            </button>
          </form>
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowSuccessPopup(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-emerald-100 p-6 sm:p-7">
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close popup"
            >
              <FaTimes />
            </button>

            <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <FaPlusCircle className="text-xl" />
            </div>

            <h2 className="text-2xl font-black text-gray-900">Admin created successfully</h2>
            <p className="text-sm text-gray-600 mt-2">
              Credentials have been sent to the admin email address.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate("/admin/dashboard");
                }}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 transition"
              >
                Go to Admin Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessPopup(false);
                  setFormData({ name: "", email: "" });
                }}
                className="w-full rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold py-2.5 transition"
              >
                Add New Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AddNewAdmin;
