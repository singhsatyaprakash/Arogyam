import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      {/* MODAL */}
      <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-xl">

        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800">
          Reschedule Appointment
        </h2>

        <p className="text-xs text-gray-500 mb-3">
          Select a new date and choose an available time slot
        </p>

        {/* Current info */}
        <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-700 mb-3">
          <p>
            <span className="font-medium">Current date:</span>{" "}
            {appointment?.date || "NA"}
          </p>
          <p>
            <span className="font-medium">Current time:</span>{" "}
            {appointment?.startTime || "NA"}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-gray-600">New date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Selected time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-green-500 outline-none"
            />
          </div>
        </div>

        {/* Slots */}
        <p className="text-sm font-semibold text-gray-800 mb-2">
          Available slots
        </p>

        <div className="max-h-60 overflow-y-auto pr-1">

          {slotsLoading && (
            <p className="text-xs text-gray-500">Loading slots...</p>
          )}

          {slotsErr && (
            <p className="text-xs text-red-500">{slotsErr}</p>
          )}

          {!slotsLoading && !slotsErr && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">

              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setTime(slot.time)}
                  className={`rounded-md border px-2 py-2 text-left transition
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
                <div className="col-span-full text-xs text-gray-500 border p-2 rounded">
                  No slots available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            Close
          </button>

          <button
            disabled={!canSubmit}
            onClick={() => onSubmit?.({ date, time })}
            className="px-4 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AppointmentReschedule;