import React, { useContext, useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import TodoList from '../../doctorComponent/TodoList';
import Calender from '../../component/Calender';
// import UpcomingAppointments from '../../doctorComponent/UpcomingAppointments';
import { DoctorContext } from '../../contexts/DoctorContext';

function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { doctor } = useContext(DoctorContext);
  const doctorName = doctor?.doctor?.name || 'Doctor';
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="px-4 py-4 md:px-6 md:py-5 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {doctorName}</h1>
            <p className="mt-1 text-gray-600">{formattedDate}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TodoList
              value={isoDate(selectedDate)}
              onChange={(iso) => setSelectedDate(new Date(iso))}
            />

            <Calender
              value={selectedDate}
              onChange={(d) => setSelectedDate(d)}
            />

            <div className="lg:col-span-2">
              {/* <UpcomingAppointments /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}