import React, { useState } from "react";
import PatientNavbar from '../../patientComponent/PatientNavbar';
import PatientFooter from '../../patientComponent/PatientFooter';

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
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <main className="pt-16 lg:pt-0 lg:pl-64 p-6">
        <h1 className="text-xl font-semibold mb-4">Reviews</h1>

        <div className="bg-white p-4 rounded shadow mb-4">
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-2">
              <select value={form.doctorId} onChange={(e)=>setForm({...form, doctorId: e.target.value})} className="flex-1 px-3 py-2 border rounded">
                {samplePast.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
              </select>
              <select value={form.rating} onChange={(e)=>setForm({...form, rating: Number(e.target.value)})} className="w-28 px-3 py-2 border rounded">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}★</option>)}
              </select>
            </div>
            <textarea value={form.comment} onChange={(e)=>setForm({...form, comment: e.target.value})} placeholder="Write your review..." className="w-full px-3 py-2 border rounded" />
            <button className="px-4 py-2 bg-green-600 text-white rounded">Submit Review</button>
          </form>
        </div>

        <div className="space-y-3">
          {reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-3 rounded shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.doctor.name}</div>
                  <div className="text-xs text-gray-500">{r.doctor.specialty} • {new Date(r.date).toLocaleString()}</div>
                </div>
                <div className="text-sm text-yellow-600">{r.rating}★</div>
              </div>
              <div className="mt-2 text-sm text-gray-700">{r.comment}</div>
            </div>
          ))}
        </div>
      </main>
      <PatientFooter />
    </div>
  );
}
