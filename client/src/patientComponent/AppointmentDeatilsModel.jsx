import React, { useContext, useMemo, useState } from 'react';
import axios from 'axios';
import { FaUserMd, FaCircle, FaCheckCircle, FaTimesCircle, FaStar, FaStethoscope, FaGraduationCap, FaClipboardList } from 'react-icons/fa';
import { PatientContext } from '../contexts/PatientContext';
import RescheduleAppointment from './RescheduleAppointment';
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

const AppointmentDeatilsModel = ({ open, appointment, onClose, onCancelled, onUpdated, onJoinVideo }) => {
  console.log(appointment);
  const {token, patient } = useContext(PatientContext);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(() => appointment?.date || '');

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsErr, setSlotsErr] = useState('');
  const [slots, setSlots] = useState([]); // [{time,type,fee}]
  const [selectedTime, setSelectedTime] = useState('');

  const doneCb = onUpdated || onCancelled;

  const authHeaders = useMemo(() => {
    const tkn = token || localStorage.getItem('token');
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token]);

  const apptStatus = (appointment?.status || '').toLowerCase();
  const isCancelled = apptStatus === 'cancelled';
  const canJoinVideo = appointment?.type === 'video' && apptStatus === 'booked' && typeof onJoinVideo === 'function';

  const doctor = appointment?.doctor && typeof appointment.doctor === 'object' ? appointment.doctor : null;

  const doctorMeta = useMemo(() => {
    const name = doctor?.name || 'Doctor';
    const specialization = doctor?.specialization || '—';
    const qualifications = Array.isArray(doctor?.qualifications) ? doctor.qualifications : [];
    const verified = !!doctor?.isVerified;
    const online = !!doctor?.isOnline;
    const rating = typeof doctor?.rating === 'number' ? doctor.rating : (doctor?.rating ? Number(doctor.rating) : null);
    const totalReviews = doctor?.totalReviews ?? null;
    const profileImage = doctor?.profileImage || '';
    return { name, specialization, qualifications, verified, online, rating, totalReviews, profileImage };
  }, [doctor]);

  const cancelAppointment = async (reason) => {
    if (!appointment?._id) return;

    const patientId = patient.patient?._id;
    if (!patientId) {
      setErr('Missing patient id');
      return;
    }

    setBusy(true);
    setErr('');
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/appointments/${appointment._id}/cancel`,
        { patientId: patient?.patient._id, reason: String(reason || '') },
        { headers: { 'Content-Type': 'application/json', ...authHeaders } }
      );
      doneCb?.();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to cancel appointment');
    } finally {
      setBusy(false);
    }
  };

  const fetchFreeSlots = async (dateStr) => {
    const doctorId =appointment?.doctor?._id;
    // console.log(doctorId);

    if (!doctorId || !dateStr) return;

    setSlotsLoading(true);
    setSlotsErr('');
    setSlots([]);
    setSelectedTime('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/appointments/availability`, {
        params: { doctorId, date: dateStr, type: appointment?.type || 'video' },
        headers: authHeaders
      });
      const list = res?.data?.data?.slots || [];
      setSlots(Array.isArray(list) ? list : []);
    } catch (e) {
      setSlotsErr(e?.response?.data?.message || e?.message || 'Failed to load free slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const rescheduleAppointment = async () => {
    if (!appointment?._id) return;
    if (!patient.patient?._id) {
      setErr('Missing patient id');
      return;
    }
    if (!rescheduleDate || !selectedTime) {
      setSlotsErr('Please select a date and time');
      return;
    }

    setBusy(true);
    setErr('');
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/appointments/${appointment._id}/reschedule`,
        { patientId: patient.patient._id, date: rescheduleDate, time: selectedTime },
        { headers: { 'Content-Type': 'application/json', ...authHeaders } }
      );
      doneCb?.();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to reschedule appointment');
    } finally {
      setBusy(false);
    }
  };

  const details = useMemo(() => {
    if (!appointment) return [];
    
    // Format dates and times
    const formattedDate = formatDateDDMMYYYY(appointment?.date);
    const formattedStartTime = formatTime12Hour(appointment?.startTime);
    const formattedEndTime = formatTime12Hour(appointment?.endTime);
    const formattedFee = appointment?.fee != null ? `₹${appointment.fee}` : '—';
    
    return [
      { k: 'Doctor', v: doctorMeta.name },
      { k: 'Specialization', v: doctorMeta.specialization },
      { k: 'Verified', v: doctorMeta.verified, isIcon: 'verified' },
      { k: 'Online Status', v: doctorMeta.online, isIcon: 'online' },
      { k: 'Rating', v: doctorMeta.rating, totalReviews: doctorMeta.totalReviews, isIcon: 'rating' },

      { k: 'Appointment Status', v: appointment?.status || '—' },
      { k: 'Consultation Type', v: (appointment?.type || '—').toUpperCase() },
      { k: 'Date', v: formattedDate },
      { k: 'Start Time', v: formattedStartTime },
      { k: 'End Time', v: formattedEndTime },

      { k: 'Consultation Fee', v: formattedFee },
      { k: 'Payment Status', v: (appointment?.paymentStatus || '—').toUpperCase() },

      { k: 'Notes', v: appointment?.notes || 'No notes' },

      ...(isCancelled
        ? [
            { k: 'Cancelled At', v: appointment?.cancelledAt ? new Date(appointment.cancelledAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(appointment.cancelledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—' },
            { k: 'Cancellation Reason', v: appointment?.cancelReason || 'No reason provided' }
          ]
        : [])
    ];
  }, [appointment, doctorMeta, isCancelled]);

  if (!open) return null;

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onClose}
          className="inline-flex w-fit items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          ← Back to list
        </button>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
          {canJoinVideo && (
            <button
              onClick={() => onJoinVideo(appointment)}
              disabled={busy}
              className="inline-flex w-fit items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              Join video call
            </button>
          )}

          {/* NEW: Reschedule */}
          {(appointment?.status || '').toLowerCase() === 'booked' && (
            <button
              onClick={() => {
                setErr('');
                setSlotsErr('');
                const initial = appointment?.date || '';
                setRescheduleDate(initial);
                setRescheduleOpen(true);
                if (initial) fetchFreeSlots(initial);
              }}
              disabled={busy}
              className="inline-flex w-fit items-center justify-center rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-60"
            >
              Reschedule
            </button>
          )}

          {/* ...existing code... Cancel appointment button */}
          {(appointment?.status || '').toLowerCase() === 'booked' && (
            <button
              onClick={() => {
                setErr('');
                setCancelReason('');
                setCancelOpen(true);
              }}
              disabled={busy}
              className="inline-flex w-fit items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel appointment
            </button>
          )}
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Doctor header */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-md">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-green-200 bg-gray-100 shadow-sm">
            {doctorMeta.profileImage ? (
              <img src={doctorMeta.profileImage} alt={doctorMeta.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-green-600">
                <FaUserMd className="text-3xl" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate text-xl font-bold text-gray-900">{doctorMeta.name}</div>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1",
                  doctorMeta.online ? "bg-green-100 text-green-800 ring-1 ring-green-300" : "bg-gray-100 text-gray-700 ring-1 ring-gray-300"
                ].join(' ')}
              >
                <FaCircle className={doctorMeta.online ? 'text-green-500 text-[6px]' : 'text-gray-400 text-[6px]'} />
                {doctorMeta.online ? 'Online' : 'Offline'}
              </span>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1",
                  doctorMeta.verified ? "bg-blue-100 text-blue-800 ring-1 ring-blue-300" : "bg-gray-100 text-gray-700 ring-1 ring-gray-300"
                ].join(' ')}
              >
                {doctorMeta.verified ? (
                  <><FaCheckCircle /> Verified</>
                ) : (
                  <><FaTimesCircle /> Not verified</>
                )}
              </span>

              <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-yellow-300 flex items-center gap-1">
                <FaStar className="text-yellow-600" />
                {doctorMeta.rating != null ? doctorMeta.rating : '—'}
              </span>
            </div>

            <div className="mt-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaStethoscope className="text-gray-500" />
              <span className="text-gray-500">Specialization:</span> {doctorMeta.specialization}
            </div>

            {doctorMeta.qualifications.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {doctorMeta.qualifications.slice(0, 8).map((q) => (
                  <span key={q} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 flex items-center gap-1">
                    <FaGraduationCap />
                    {q}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
        <div className="px-5 py-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FaClipboardList className="text-green-600" />
            Appointment Details
          </div>
          <div className="mt-1 text-xs text-gray-600">
            ID: <span className="font-mono text-gray-800">{appointment?._id || '—'}</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {details.map((row) => (
            <div key={row.k} className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-1 sm:gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="text-sm font-semibold text-gray-700">{row.k}</div>
              <div className="text-sm text-gray-900 break-words whitespace-pre-wrap font-medium flex items-center gap-2">
                {row.isIcon === 'verified' ? (
                  row.v ? (
                    <><FaCheckCircle className="text-green-600" /> Yes</>
                  ) : (
                    <><FaTimesCircle className="text-gray-400" /> No</>
                  )
                ) : row.isIcon === 'online' ? (
                  row.v ? (
                    <><FaCircle className="text-green-500 text-xs" /> Online</>
                  ) : (
                    <><FaCircle className="text-gray-400 text-xs" /> Offline</>
                  )
                ) : row.isIcon === 'rating' ? (
                  row.v != null ? (
                    <><FaStar className="text-yellow-500" /> {row.v}{row.totalReviews != null ? ` (${row.totalReviews} reviews)` : ''}</>
                  ) : (
                    '—'
                  )
                ) : (
                  String(row.v ?? '—')
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: Cancel popup */}
      {cancelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCancelOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="text-base font-semibold text-gray-900">Cancel appointment</div>
              <div className="mt-1 text-sm text-gray-600">
                Please tell us why you want to cancel (optional).
              </div>
            </div>

            <div className="px-4 py-4">
              <label className="block text-sm font-medium text-gray-800">Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Eg: Not available at that time..."
              />

              <div className="mt-3 text-xs text-gray-600">
                By cancelling, you agree to our{' '}
                <a
                  href="/terms-and-conditions#cancellation"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-700 hover:underline"
                >
                  Terms &amp; Conditions for cancellation
                </a>
                .
              </div>
            </div>

            <div className="px-4 py-3 border-t bg-white flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelOpen(false)}
                disabled={busy}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await cancelAppointment(cancelReason);
                  // if cancel succeeded, parent will close details; still close popup defensively
                  setCancelOpen(false);
                }}
                disabled={busy}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? 'Cancelling...' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Reschedule popup */}
      {rescheduleOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRescheduleOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="text-base font-semibold text-gray-900">Reschedule appointment</div>
              <div className="mt-1 text-sm text-gray-600">Pick a date and choose from available free slots.</div>
            </div>

            <div className="px-4 py-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-800">Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRescheduleDate(v);
                    setSlotsErr('');
                    if (v) fetchFreeSlots(v);
                  }}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-sm font-medium text-gray-800">Free slots</label>
                  <button
                    type="button"
                    onClick={() => rescheduleDate && fetchFreeSlots(rescheduleDate)}
                    disabled={slotsLoading || !rescheduleDate}
                    className="text-xs font-medium text-green-700 hover:underline disabled:opacity-60"
                  >
                    Refresh slots
                  </button>
                </div>

                <div className="mt-2">
                  {slotsLoading && (
                    <div className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-600">
                      Loading slots...
                    </div>
                  )}

                  {slotsErr && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {slotsErr}
                    </div>
                  )}

                  {!slotsLoading && !slotsErr && slots.length === 0 && (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                      No free slots found for this date.
                    </div>
                  )}

                 {!slotsLoading && slots.length > 0 && (
                  <RescheduleAppointment
                    slots={slots}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                  />
                )}
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  By rescheduling, you agree to our{' '}
                  <a
                    href="/terms-and-conditions#rescheduling"
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-700 hover:underline"
                  >
                    Terms &amp; Conditions for rescheduling
                  </a>
                  .
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t bg-white flex items-center justify-end gap-2">
              <button
                onClick={() => setRescheduleOpen(false)}
                disabled={busy}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await rescheduleAppointment();
                  setRescheduleOpen(false);
                }}
                disabled={busy || !rescheduleDate || !selectedTime}
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? 'Rescheduling...' : 'Confirm reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDeatilsModel;
