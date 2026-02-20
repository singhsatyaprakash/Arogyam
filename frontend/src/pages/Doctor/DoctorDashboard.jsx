import React, { useState } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import TodoList from '../../doctorComponent/TodoList';
import Calender from '../../component/Calender';
import UpcomingAppointments from '../../doctorComponent/UpcomingAppointments';
import { useDoctor } from '../../contexts/DoctorContext';

function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { doctor } = useDoctor();
  console.log(doctor);
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="p-4 md:p-6 lg:ml-64">
        <h1 className="text-2xl font-bold text-gray-800 pb-4">Welcome Back! Dr. {doctor?.name || "Doctor"}</h1>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodoList
            value={isoDate(selectedDate)}
            onChange={(iso) => setSelectedDate(new Date(iso))}
          />
          <Calender
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
          />
          <div className="lg:col-span-2">
            <UpcomingAppointments />
          </div>
        </div>
      </div>
    </div>
  );
}