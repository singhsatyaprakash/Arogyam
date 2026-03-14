import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaComments,
  FaVideo,
  FaStar,
  FaArrowUp,
} from "react-icons/fa";
import PatientNavbar from "../../patientComponent/PatientNavbar";
import { PatientContext} from "../../contexts/PatientContext";



const PatientDashboard = () => {
  const navigate = useNavigate();
  const { patient} = useContext(PatientContext);
  // console.log(patient);

  if (!patient){
    alert("No patient data found. Please log in again.");
    navigate('/');
    return;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {patient?.patient?.name?.split(" ")[0] || "Patient"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here's what's happening with your health journey
            </p>
          </div>
          {/* Quick Actions */}
          <div className="takeyoumedicine">
            Medicine list component
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            Todo
          </div>
          <div>
            Recent Activities component
          </div>
          <div>
            Health Insights component
          </div>
          <div>
            upcoming appointments component
          </div>
           <div>
            Health Tips component
            </div>
            <div>
            Doctor Recommendations component
            </div>
            <div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
