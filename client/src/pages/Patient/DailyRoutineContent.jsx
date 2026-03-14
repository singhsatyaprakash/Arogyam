import React from "react";
import PatientNavbar from '../../patientComponent/PatientNavbar';
import PatientFooter from '../../patientComponent/PatientFooter';
import { FaClipboardList } from "react-icons/fa";

export default function DailyRoutineContent(){
  const routines = [
    { id: 1, title: "Morning Walk", time: "7:00 AM", note: "20 mins brisk walk" },
    { id: 2, title: "Medication", time: "8:00 AM", note: "Take vitamins" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <main className="pt-16 lg:pt-0 lg:pl-64 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center my-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <FaClipboardList className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold mt-4">Daily Routine Content</h1>
            <p className="text-gray-500 mt-2">Manage your daily health routines and wellness activities</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">My Routines</h2>
              <button className="px-3 py-1 bg-green-600 text-white rounded">Add Routine</button>
            </div>

            {routines.length === 0 ? (
              <div className="text-gray-500">No routines yet. Add your daily activities.</div>
            ) : (
              <div className="space-y-3">
                {routines.map(r => (
                  <div key={r.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-sm text-gray-500">{r.time} • {r.note}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded">Edit</button>
                      <button className="px-2 py-1 border rounded text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <PatientFooter />
    </div>
  );
}
