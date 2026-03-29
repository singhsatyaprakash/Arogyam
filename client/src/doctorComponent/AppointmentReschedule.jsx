import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

const formatDateDdMmmYy = (dateLike) => {
  if (!dateLike) return "NA";

  const parsed =
    typeof dateLike === "string"
      ? new Date(`${dateLike}T00:00:00`)
      : new Date(dateLike);

  if (Number.isNaN(parsed.getTime())) return "NA";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = parsed.toLocaleString("en-US", { month: "short" });
  const year = String(parsed.getFullYear()).slice(-2);

  return `${day} ${month} ${year}`;
};

const AppointmentReschedule = ({
  open,
  appointment,
  doctorId,
  authHeaders = {},
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsErr, setSlotsErr] = useState("");

  useEffect(() => {
    if (!open) return;

    setDate(appointment?.date || "");
    setTime("");
    setSlots([]);
    setSlotsErr("");
  }, [open, appointment]);

  useEffect(() => {
    if (!open || !doctorId || !date) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsErr("");

      try {
        const res = await axios.get(`${API_URL}/appointments/availability`, {
          params: {
            doctorId,
            date,
            type: appointment?.type || "video",
          },
          headers: authHeaders,
        });

        const allSlots = res?.data?.data?.slots || [];
        const oldTime = appointment?.startTime;

        const filtered = allSlots.filter((s) => s.time !== oldTime);

        setSlots(filtered);
      } catch (e) {
        setSlotsErr(e?.response?.data?.message || "Failed to fetch slots");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [open, doctorId, date, appointment, authHeaders]);

  const canSubmit = useMemo(() => date && time && !loading, [date, time, loading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">

      {/* MODAL */}
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-red-100 bg-gradient-to-br from-white to-red-50/30 p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Reschedule Appointment
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Select a new date and choose an available time slot
        </p>

        {/* Current info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
            <p className="text-xs text-gray-500 mb-1">Current date</p>
            <p className="font-semibold text-gray-900">{formatDateDdMmmYy(appointment?.date)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
            <p className="text-xs text-gray-500 mb-1">Current time</p>
            <p className="font-semibold text-gray-900">{appointment?.startTime || "NA"}</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-600">New date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
            />
            <p className="mt-1 text-xs text-gray-500">{formatDateDdMmmYy(date)}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Selected time</label>
            <div
              className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm transition ${
                time
                  ? "border-green-300 bg-green-50 text-green-800 font-semibold"
                  : "border-gray-300 bg-gray-50 text-gray-400"
              }`}
              aria-live="polite"
            >
              {time || "Select a slot below"}
            </div>
          </div>
        </div>

        {/* Slots */}
        <p className="text-sm font-semibold text-gray-800 mb-2">
          Available slots
        </p>

        <div className="max-h-64 overflow-y-auto pr-1 rounded-xl">

          {slotsLoading && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">Loading slots...</p>
          )}

          {slotsErr && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{slotsErr}</p>
          )}

          {!slotsLoading && !slotsErr && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">

              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setTime(slot.time)}
                  className={`rounded-xl border px-3 py-2.5 text-left transition shadow-sm
                    ${
                      time === slot.time
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                    }`}
                >
                  <p className="text-sm font-semibold">{slot.time}</p>
                  <p
                    className={`text-[11px] ${
                      time === slot.time ? "text-green-100" : "text-green-700"
                    }`}
                  >
                    ₹{slot.fee}
                  </p>
                </button>
              ))}

              {slots.length === 0 && (
                <div className="col-span-full text-xs text-gray-500 border border-dashed border-gray-300 bg-gray-50 p-3 rounded-xl text-center">
                  No slots available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition"
          >
            Close
          </button>

          <button
            disabled={!canSubmit}
            onClick={() => onSubmit?.({ date, time })}
            className="px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AppointmentReschedule;