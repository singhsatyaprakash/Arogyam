// Medicines.jsx
import React, { useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { FaPills, FaPlus, FaBell, FaTrash, FaCalendarAlt, FaClock } from 'react-icons/fa';

import {useDoctor} from "../../contexts/DoctorContext";
const Medicines = () => {
  const {doctor} = useDoctor();

  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Aspirin',
      dosage: '75mg',
      frequency: 'Once daily',
      purpose: 'Blood thinner',
      time: 'Morning',
      active: true
    },
    {
      id: 2,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Daily',
      purpose: 'Supplement',
      time: 'Morning',
      active: true
    },
    {
      id: 3,
      name: 'Omega-3',
      dosage: '1000mg',
      frequency: 'Twice daily',
      purpose: 'Heart health',
      time: 'Morning & Evening',
      active: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    purpose: '',
    time: ''
  });

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setMedications([
        ...medications,
        {
          id: medications.length + 1,
          ...newMedication,
          active: true
        }
      ]);
      setNewMedication({ name: '', dosage: '', frequency: '', purpose: '', time: '' });
      setShowAddForm(false);
    }
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const toggleMedication = (id) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, active: !med.active } : med
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-orange-50/40">
      <DoctorNavbar />
      
      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <FaPills className="text-red-500" />
              My Personal Medications
            </h2>
            <p className="text-gray-500 mt-1">Track your daily medications</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-rose-700">Daily tracking</span>
              <span className="text-xs rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700">Active reminders</span>
              <span className="text-xs rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-sky-700">Quick updates</span>
            </div>
          </div>

          {/* Add Medication Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-rose-700 transition flex items-center gap-2 shadow-sm"
            >
              <FaPlus />
              Add New Medication
            </button>
          </div>

          {/* Add Medication Form */}
          {showAddForm && (
            <div className="mb-6 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Medication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Medication Name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 75mg, 1000 IU)"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g., Once daily)"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Time (e.g., Morning, Evening)"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Purpose"
                  value={newMedication.purpose}
                  onChange={(e) => setNewMedication({...newMedication, purpose: e.target.value})}
                  className="p-3 border border-gray-300 rounded-xl md:col-span-2 focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
                <button
                  onClick={addMedication}
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2.5 rounded-xl hover:from-red-600 hover:to-rose-700 transition"
                >
                  Save Medication
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="border border-gray-300 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Medications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {medications.map((med) => (
              <div key={med.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      med.active ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <FaPills className={`text-xl ${med.active ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{med.name}</h3>
                      <p className="text-lg font-semibold text-red-500">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleMedication(med.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <FaBell />
                    </button>
                    <button
                      onClick={() => removeMedication(med.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium">{med.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{med.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose:</span>
                    <span className="font-medium">{med.purpose}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${med.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm">{med.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <button
                    onClick={() => toggleMedication(med.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                      med.active
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {med.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm">Total Medications</h3>
              <p className="text-2xl font-bold text-gray-800">{medications.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-200">
              <h3 className="text-gray-500 text-sm">Active</h3>
              <p className="text-2xl font-bold text-green-600">
                {medications.filter(m => m.active).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-200">
              <h3 className="text-gray-500 text-sm">Daily Doses</h3>
              <p className="text-2xl font-bold text-blue-600">5</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-rose-200">
              <h3 className="text-gray-500 text-sm">Next Dose</h3>
              <p className="text-2xl font-bold text-red-600">2:00 PM</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Medicines;