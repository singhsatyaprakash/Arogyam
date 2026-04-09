import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaComments,
  FaVideo,
  FaHeartbeat,
  FaPills,
  FaBell,
  FaUserMd,
} from "react-icons/fa";
import PatientNavbar from "../../patientComponent/PatientNavbar";
import { PatientContext} from "../../contexts/PatientContext";



const PatientDashboard = () => {
  const navigate = useNavigate();
  const { patient} = useContext(PatientContext);
  const firstName = patient?.patient?.name?.split(" ")[0] || "Patient";

  useEffect(() => {
    if (!patient) {
      navigate("/", { replace: true });
    }
  }, [patient, navigate]);

  if (!patient) return null;

  const quickActions = [
    {
      title: "Book Appointment",
      subtitle: "Schedule with top specialists",
      icon: <FaCalendarAlt className="text-emerald-600" />,
      action: () => navigate("/patient/book-appointment"),
    },
    {
      title: "My Appointments",
      subtitle: "View upcoming and past visits",
      icon: <FaVideo className="text-sky-600" />,
      action: () => navigate("/patient/booked-appointment"),
    },
    {
      title: "Messages",
      subtitle: "Continue doctor conversations",
      icon: <FaComments className="text-violet-600" />,
      action: () => navigate("/patient/chats"),
    },
    {
      title: "Medicine List",
      subtitle: "Track active prescriptions",
      icon: <FaPills className="text-amber-600" />,
      action: () => navigate("/patient/medicine-list"),
    },
  ];

  const upcomingAppointments = [
    { doctor: "Dr. Anjali Menon", speciality: "Cardiology", date: "Apr 02, 2026", time: "10:30 AM", mode: "Video" },
    { doctor: "Dr. Rohan Das", speciality: "Dermatology", date: "Apr 06, 2026", time: "04:00 PM", mode: "In-person" },
  ];

  const recentActivities = [
    "Uploaded blood test report",
    "Completed consultation with Dr. Vivek",
    "Payment confirmed for follow-up session",
  ];

  const healthTips = [
    "Stay hydrated: aim for at least 2L water daily.",
    "Take a 20-minute walk to improve cardiovascular health.",
    "Maintain a regular sleep window for better recovery.",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
            <p className="text-gray-600 text-sm mt-1">Here is your health overview for today.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {quickActions.map((item) => (
              <button
                key={item.title}
                onClick={item.action}
                className="group text-left rounded-xl bg-white border border-gray-200 p-5 hover:bg-gray-50 transition"
              >
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.subtitle}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <section className="xl:col-span-2 rounded-xl bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <button
                  onClick={() => navigate("/patient/booked-appointment")}
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={`${appt.doctor}-${appt.date}`}
                    className="rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{appt.doctor}</p>
                      <p className="text-sm text-gray-500">{appt.speciality}</p>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p>{appt.date}</p>
                      <p>{appt.time}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 w-fit">
                      {appt.mode}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
              <ul className="space-y-3">
                {recentActivities.map((item) => (
                  <li key={item} className="text-sm text-gray-700 flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
                <FaHeartbeat className="text-cyan-600" /> Health Insights
              </h3>
              <p className="text-sm text-gray-700 mt-2">
                Your average consultation follow-up time improved by 18% this month.
              </p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900">Health Tips</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {healthTips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-500 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
                <FaUserMd className="text-violet-600" /> Doctor Recommendations
              </h3>
              <p className="text-sm text-gray-700 mt-2">
                Based on your last reports, consider booking a preventive wellness consultation this week.
              </p>
              <button
                onClick={() => navigate("/patient/book-appointment")}
                className="mt-4 rounded-lg bg-violet-600 text-white px-4 py-2 text-sm hover:bg-violet-700 transition"
              >
                Find Doctors
              </button>
            </section>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 text-gray-700">
              <FaBell className="text-amber-500" />
              <span className="text-sm">Enable reminders so you never miss a consultation.</span>
            </div>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition">
              Manage Alerts
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;


