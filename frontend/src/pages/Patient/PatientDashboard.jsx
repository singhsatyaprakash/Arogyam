import React from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaComments,
  FaVideo,
  FaStar,
  FaArrowUp,
} from "react-icons/fa";
import { usePatientAuth } from "../../contexts/PatientContext";
import PatientNavbar from "../../patientComponent/PatientNavbar";



const PatientDashboard = () => {
  const { patient, loading } = usePatientAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!patient) return <div className="p-6">No patient data</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {patient.name?.split(" ")[0] || "Patient"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here's what's happening with your health journey
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
