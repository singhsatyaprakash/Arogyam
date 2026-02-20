import React, { useMemo, useState } from "react";
import { MdChat, MdVerified, MdAccessTime } from "react-icons/md";

const ChatBookingOnly = ({ doctor, patient, onProceed }) => {
  const [note, setNote] = useState("");

  const chatFee = useMemo(() => {
    return Number(doctor?.consultationFee?.chat ?? 0);
  }, [doctor]);
  // console.log("ChatBookingOnly - doctor:", doctor, "patient:", patient, "chatFee:", chatFee);
  return (
    <div className="mt-5 bg-white rounded-xl p-5 shadow-sm border">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <MdChat className="text-green-600" />
            Chat Consultation
          </h3>
          <p className="text-sm text-blue-500 mt-1">
            After payment, chat will be active for <span className="font-semibold text-green-600">10 days</span>.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Chat Fee</p>
          <p className="text-lg font-bold text-gray-800">₹{chatFee}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Doctor */}
        <div className="rounded-xl border p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Doctor</p>
            {doctor?.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <MdVerified /> Verified
              </span>
            )}
          </div>
          <p className="text-base font-semibold text-gray-800 mt-1">{doctor?.name}</p>
          <p className="text-sm text-gray-600">{doctor?.specialization}</p>

          <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <MdAccessTime className="text-gray-500" />
            <span>
              Available: {doctor?.availability?.from || "N/A"} - {doctor?.availability?.to || "N/A"}
            </span>
          </div>
        </div>

        {/* Patient */}
        <div className="rounded-xl border p-4 bg-gray-50">
          <p className="text-sm text-gray-500">Patient</p>
          <p className="text-base font-semibold text-gray-800 mt-1">
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
          className="mt-2 w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
          rows={3}
        />
      </div>

      {/* Action */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
        <div className="text-xs text-gray-500">
          Chat access: <span className="font-semibold text-gray-700">10 days</span> after payment
        </div>

        <button
          onClick={() => onProceed(note)}
          className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 w-full sm:w-auto"
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default ChatBookingOnly;
