import React, { useMemo } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaVideo,
  FaPhone,
  FaComments,
  FaHospital,
  FaClipboardList,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';

// Helper: Convert YYYY-MM-DD to DD Month YYYY (e.g., 03 April 2026)
const formatDateDDMonYYYY = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '—';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
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

const AppointmentCard = ({ appointment, onView, onJoinVideo }) => {
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

  const doctorInitials = useMemo(() => {
    if (!doctorName) return 'DR';
    const parts = doctorName.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [doctorName]);

  const type = (appointment?.type || '—').toString();
  const status = (appointment?.status || '—').toLowerCase();
  const canJoinVideo = type === 'video' && status === 'booked' && typeof onJoinVideo === 'function';
  const typeKey = type.toLowerCase();
  
  const date = formatDateDDMonYYYY(appointment?.date);
  const startTime = formatTime12Hour(appointment?.startTime);
  const endTime = formatTime12Hour(appointment?.endTime);
  const fee = appointment?.fee != null ? `₹${appointment.fee}` : '—';

  // Status badge styling
  const statusConfig = {
    booked: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Booked' },
    cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', label: 'Cancelled' },
    completed: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', label: 'Completed' },
  };
  const statusStyle = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200', label: status };

  // Type badge styling
  const typeConfig = {
    video: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', icon: <FaVideo className="text-[11px]" /> },
    voice: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', icon: <FaPhone className="text-[11px]" /> },
    chat: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', icon: <FaComments className="text-[11px]" /> },
    'in-person': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', icon: <FaHospital className="text-[11px]" /> },
  };
  const typeStyle = typeConfig[typeKey] || { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-200', icon: <FaClipboardList className="text-[11px]" /> };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header with status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
          {doctorInitials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate tracking-tight">{doctorName}</h3>
            {doctor?.isVerified && (
              <span className="inline-flex items-center text-emerald-600" title="Verified Doctor">
                <FaCheckCircle />
              </span>
            )}
          </div>
          {doctorSpecialization && (
            <p className="text-sm text-gray-600">{doctorSpecialization}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
              {statusStyle.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${typeStyle.bg} ${typeStyle.text} ${typeStyle.ring}`}>
              {typeStyle.icon}
              <span className="capitalize">{type}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Appointment details */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-3 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium inline-flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /> Date</span>
          <span className="text-gray-900 font-semibold">{date}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium inline-flex items-center gap-2"><FaClock className="text-gray-400" /> Time</span>
          <span className="text-gray-900 font-semibold">{startTime} - {endTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium inline-flex items-center gap-2"><FaMoneyBillWave className="text-gray-400" /> Fee</span>
          <span className="text-gray-900 font-semibold">{fee}</span>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4 flex gap-2">
        {canJoinVideo && (
          <button
            onClick={() => onJoinVideo(appointment)}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors duration-200 shadow-sm"
          >
            Join Video
          </button>
        )}

        <button
          onClick={onView}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 shadow-sm ${canJoinVideo ? 'flex-1 border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50' : 'w-full bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          View Details <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;