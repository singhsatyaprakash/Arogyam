import React, { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800">Cancel Appointment</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please share a short reason for cancellation.
        </p>

        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          <p>
            <span className="font-medium">Patient:</span>{" "}
            {appointment?.patient?.name || "Patient"}
          </p>
          <p>
            <span className="font-medium">Date:</span> {appointment?.date || "NA"}
          </p>
          <p>
            <span className="font-medium">Time:</span> {appointment?.startTime || "NA"}
          </p>
        </div>

        <label className="mt-4 block text-sm font-medium text-gray-700" htmlFor="cancel-reason">
          Reason
        </label>
        <textarea
          id="cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Type cancellation reason"
          className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-red-500"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => {
              setReason("");
              onClose?.();
            }}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Close
          </button>
          <button
            onClick={() => onSubmit?.(reason.trim())}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCancel;
