import React, { useMemo, useState } from "react";
import { MdChat, MdVerified, MdAccessTime, MdPerson, MdInfoOutline } from "react-icons/md";

const ChatBookingOnly = ({ doctor, patient, onProceed }) => {
  const [note, setNote] = useState("");

  const chatFee = useMemo(() => {
    return Number(doctor?.consultationFee?.chat ?? 0);
  }, [doctor]);
  // console.log("ChatBookingOnly - doctor:", doctor, "patient:", patient, "chatFee:", chatFee);
  return (
    <div className="mt-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-xl flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700">
              <MdChat className="text-xl" />
            </span>
            Chat Consultation
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            After payment, chat will be active for <span className="font-semibold text-emerald-700">10 days</span>.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:text-right">
          <p className="text-xs text-emerald-700 uppercase tracking-wide">Chat Fee</p>
          <p className="text-xl font-bold text-emerald-900">₹{chatFee}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs text-cyan-800 inline-flex items-center gap-1.5">
        <MdInfoOutline className="text-sm" />
        Prescription follow-up and clarifications are included during the chat period.
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Doctor */}
        <div className="rounded-2xl border border-gray-200 p-4 bg-gradient-to-b from-white to-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 inline-flex items-center gap-1"><MdPerson /> Doctor</p>
            {doctor?.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                <MdVerified /> Verified
              </span>
            )}
          </div>
          <p className="text-base font-semibold text-gray-900 mt-1">{doctor?.name}</p>
          <p className="text-sm text-gray-600">{doctor?.specialization}</p>

          <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
            <MdAccessTime className="text-gray-500" />
            <span>
              Available: {doctor?.availability?.from || "N/A"} - {doctor?.availability?.to || "N/A"}
            </span>
          </div>
        </div>

        {/* Patient */}
        <div className="rounded-2xl border border-gray-200 p-4 bg-gradient-to-b from-white to-gray-50">
          <p className="text-sm text-gray-500 inline-flex items-center gap-1"><MdPerson /> Patient</p>
          <p className="text-base font-semibold text-gray-900 mt-1">
            {patient?.name || patient?.fullName || "Patient"}
          </p>
          <p className="text-sm text-gray-600">
            Age: <span className="font-medium">{patient?.age || "N/A"}</span>
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Your chat connection will be created after successful payment.
          </p>
        </div>
      </div>

      {/* Patient Note */}
      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">
          Describe your issue (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Example: Fever for 2 days, headache, need quick advice..."
          className="mt-2 w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          rows={4}
        />
      </div>

      {/* Action */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-4">
        <div className="text-xs text-gray-500">
          Chat access: <span className="font-semibold text-gray-700">10 days</span> after payment
        </div>

        <button
          onClick={() => onProceed(note)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 w-full sm:w-auto shadow-sm"
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default ChatBookingOnly;
