import React, { useMemo } from 'react';

// Helper: Convert YYYY-MM-DD to DD/MM/YYYY
const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Helper: Convert HH:mm to 12-hour format with AM/PM
const formatTime12Hour = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return '—';
  const [hh, mm] = timeStr.split(':');
  if (!hh || !mm) return timeStr;
  const hour = parseInt(hh, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${mm} ${period}`;
};

const AppointmentCard = ({ appointment, onView }) => {
  const doctor = appointment?.doctor;
  const doctorName = useMemo(() => {
    if (!doctor) return 'Doctor';
    if (typeof doctor === 'string') return 'Doctor';
    return doctor?.name || doctor?.fullName || `${doctor?.firstName || ''} ${doctor?.lastName || ''}`.trim() || 'Doctor';
  }, [doctor]);

  const doctorSpecialization = useMemo(() => {
    if (!doctor || typeof doctor === 'string') return null;
    return doctor?.specialization || null;
  }, [doctor]);

  const type = (appointment?.type || '—').toString();
  const status = (appointment?.status || '—').toLowerCase();
  
  const date = formatDateDDMMYYYY(appointment?.date);
  const startTime = formatTime12Hour(appointment?.startTime);
  const endTime = formatTime12Hour(appointment?.endTime);
  const fee = appointment?.fee != null ? `₹${appointment.fee}` : '—';

  // Status badge styling
  const statusConfig = {
    booked: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200', label: 'Booked' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', label: 'Cancelled' },
    completed: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', label: 'Completed' },
  };
  const statusStyle = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200', label: status };

  // Type badge styling
  const typeConfig = {
    video: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200', icon: '🎥' },
    voice: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', icon: '📞' },
    chat: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200', icon: '💬' },
    'in-person': { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', icon: '🏥' },
  };
  const typeStyle = typeConfig[type] || { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200', icon: '📋' };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header with status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{doctorName}</h3>
            {doctor?.isVerified && (
              <span className="text-blue-500" title="Verified Doctor">✓</span>
            )}
          </div>
          {doctorSpecialization && (
            <p className="text-sm text-gray-600 mb-1">{doctorSpecialization}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
              {statusStyle.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${typeStyle.bg} ${typeStyle.text} ${typeStyle.ring}`}>
              <span>{typeStyle.icon}</span>
              <span className="capitalize">{type}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Appointment details */}
      <div className="border-t border-gray-100 pt-3 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">📅 Date</span>
          <span className="text-gray-900 font-semibold">{date}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">🕐 Time</span>
          <span className="text-gray-900 font-semibold">{startTime} - {endTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">💰 Fee</span>
          <span className="text-gray-900 font-semibold">{fee}</span>
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={onView}
        className="mt-4 w-full inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors duration-200 shadow-sm"
      >
        View Details →
      </button>
    </div>
  );
};

export default AppointmentCard;