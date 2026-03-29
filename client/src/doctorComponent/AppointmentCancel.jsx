import React, { useState } from "react";
import { FaCalendarAlt, FaClock, FaUserInjured, FaExclamationTriangle } from "react-icons/fa";

const formatDateLong = (dateLike) => {
  if (!dateLike) return "NA";
  const parsed =
    typeof dateLike === "string" ? new Date(`${dateLike}T00:00:00`) : new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return "NA";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const AppointmentCancel = ({
  open,
  appointment,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white to-rose-50/30 shadow-2xl border border-rose-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-red-50">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 inline-flex items-center gap-2 tracking-tight">
            <FaExclamationTriangle className="text-rose-500" />
            Cancel Appointment
          </h2>
          <p className="mt-1.5 text-sm text-gray-600">
            Please share a short reason for cancellation.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <FaUserInjured className="text-gray-500" />
              <span className="font-medium text-gray-800">Patient:</span>
              <span>{appointment?.patient?.name || "Patient"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <span className="font-medium text-gray-800">Date:</span>
              <span>{formatDateLong(appointment?.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-500" />
              <span className="font-medium text-gray-800">Time:</span>
              <span>{appointment?.startTime || "NA"}</span>
            </div>
          </div>

          <label className="mt-5 block text-sm font-medium text-gray-700" htmlFor="cancel-reason">
            Reason
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Type cancellation reason"
            className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-white"
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              A clear reason helps patients understand and rebook quickly.
            </p>
            <span className="text-xs text-gray-400 shrink-0">{reason.trim().length}/250</span>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              onClick={() => {
                setReason("");
                onClose?.();
              }}
              disabled={loading}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition"
            >
              Close
            </button>
            <button
              onClick={() => onSubmit?.(reason.trim())}
              disabled={loading || !reason.trim()}
              className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 text-sm font-medium text-white hover:from-rose-700 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCancel;
