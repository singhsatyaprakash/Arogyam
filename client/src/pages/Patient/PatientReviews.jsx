import React, { useState } from "react";
import PatientNavbar from '../../patientComponent/PatientNavbar';
import PatientFooter from '../../patientComponent/PatientFooter';
import { FaStar, FaUserMd, FaPenFancy } from "react-icons/fa";

const samplePast = [
  { id:1, name: "Dr. Asha Rao", specialty: "Cardiologist" },
  { id:2, name: "Dr. Vikram Singh", specialty: "General Physician" }
];

export default function PatientReviews(){
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ doctorId: samplePast[0].id, rating: 5, comment: "" });

  const submit = (e) => {
    e.preventDefault();
    const doc = samplePast.find(d => d.id === Number(form.doctorId));
    setReviews(r => [{ doctor: doc, rating: form.rating, comment: form.comment, date: new Date().toISOString() }, ...r]);
    setForm({ ...form, comment: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-cyan-50/50 flex flex-col">
      <PatientNavbar />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="rounded-2xl border border-emerald-100 bg-white/90 backdrop-blur p-6 sm:p-7 shadow-sm mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-600 mt-2">Share your consultation experience and help improve care quality.</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
            <FaPenFancy /> Your feedback matters
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 inline-flex items-center justify-center">
              <FaUserMd />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Write a Review</h2>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={form.doctorId}
                onChange={(e)=>setForm({...form, doctorId: e.target.value})}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
              >
                {samplePast.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>

              <select
                value={form.rating}
                onChange={(e)=>setForm({...form, rating: Number(e.target.value)})}
                className="w-full sm:w-36 px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
              >
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star</option>)}
              </select>
            </div>

            <textarea
              value={form.comment}
              onChange={(e)=>setForm({...form, comment: e.target.value})}
              placeholder="Write your review..."
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
            />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} className={s <= form.rating ? "opacity-100" : "opacity-30"} />
                ))}
                <span className="text-xs text-gray-500 ml-2">Selected: {form.rating} star{form.rating > 1 ? "s" : ""}</span>
              </div>

              <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-sm">
                Submit Review
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-3">
          {reviews.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-gray-100 text-gray-400 inline-flex items-center justify-center mb-3">
                <FaStar />
              </div>
              <p className="text-gray-700 font-medium">No reviews yet.</p>
              <p className="text-sm text-gray-500 mt-1">Your submitted feedback will appear here.</p>
            </div>
          )}

          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{r.doctor.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.doctor.specialty} • {new Date(r.date).toLocaleString()}</div>
                </div>
                <div className="inline-flex items-center gap-1 text-sm text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <FaStar className="text-xs" /> {r.rating}
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-700 leading-relaxed">{r.comment}</div>
            </div>
          ))}
        </div>
        </div>
      </main>
      <div className="lg:ml-64">
        <PatientFooter />
      </div>
    </div>
  );
}
