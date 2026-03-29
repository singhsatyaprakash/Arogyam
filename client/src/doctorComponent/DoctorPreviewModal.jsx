const DoctorPreviewModal = ({ data, onClose }) => {
  const nameWithTitle = `${data.title} ${data.name}`;

  return (
    <div className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-rose-50/30 max-w-2xl w-full rounded-3xl shadow-2xl p-6 md:p-8 relative border border-rose-100 max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition rounded-full p-1.5 hover:bg-gray-100"
          aria-label="Close preview"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 flex items-center justify-center gap-2 tracking-tight">
          <span className="text-rose-500">✓</span>
          Preview Your Profile
        </h2>

        <div className="space-y-4">
          {/* Personal Info Section */}
          <div className="bg-gradient-to-r from-rose-50/90 to-pink-50/90 p-4 rounded-xl border border-rose-100">
            <h3 className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Personal Information
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong className="text-gray-900">Name:</strong> {nameWithTitle}</p>
              <p><strong className="text-gray-900">Email:</strong> {data.email}</p>
              <p><strong className="text-gray-900">Phone:</strong> {data.phone}</p>
            </div>
          </div>

          {/* Professional Info Section */}
          <div className="bg-gradient-to-r from-blue-50/90 to-cyan-50/90 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Professional Details
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong className="text-gray-900">Specialization:</strong> {data.specialization}</p>
              <p><strong className="text-gray-900">Experience:</strong> {data.experience} years</p>
              <p><strong className="text-gray-900">Qualifications:</strong> {data.qualifications}</p>
              <p><strong className="text-gray-900">Languages:</strong> {data.languages}</p>
            </div>
          </div>

          {/* Fees Section */}
          <div className="bg-gradient-to-r from-emerald-50/90 to-green-50/90 p-4 rounded-xl border border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.16 2.75a.75.75 0 00-1.08.6v5.69H2.75a.75.75 0 00-.75.75v1.6c0 .414.336.75.75.75h4.33v5.69c0 .464.576.708 1.08.6.382-.086.68-.452.68-.85V11.5h4.33a.75.75 0 00.75-.75v-1.6a.75.75 0 00-.75-.75h-4.33V2.75c0-.398-.298-.764-.68-.85z" />
              </svg>
              Consultation Fees
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded-xl p-3 text-center border-2 border-emerald-200">
                <p className="text-gray-600 text-xs font-medium mb-1">Chat</p>
                <p className="text-xl font-bold text-emerald-600">₹{data.chatFee}</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border-2 border-emerald-200">
                <p className="text-gray-600 text-xs font-medium mb-1">Voice</p>
                <p className="text-xl font-bold text-emerald-600">₹{data.voiceFee}</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border-2 border-emerald-200">
                <p className="text-gray-600 text-xs font-medium mb-1">Video</p>
                <p className="text-xl font-bold text-emerald-600">₹{data.videoFee}</p>
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div className="bg-gradient-to-r from-violet-50/90 to-fuchsia-50/90 p-4 rounded-xl border border-violet-100">
            <h3 className="text-sm font-bold text-violet-700 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v2H4a2 2 0 00-2 2v2h16V7a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v2H7V3a1 1 0 00-1-1zm0 5a2 2 0 002 2h8a2 2 0 002-2H6z" clipRule="evenodd" />
              </svg>
              Availability
            </h3>
            <p className="text-sm text-gray-700"><strong className="text-gray-900">Working Hours:</strong> {data.fromTime} - {data.toTime} (24-hour format)</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-gradient-to-r from-rose-500 to-red-600 text-white py-3 rounded-xl hover:shadow-md transform hover:scale-[1.01] transition-all duration-200 font-semibold"
        >
          Close & Continue
        </button>
      </div>
    </div>
  );
};

export default DoctorPreviewModal;
