import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaUserMd } from "react-icons/fa";

const formatDuration = (totalSeconds) => {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const VideoNavbar = ({ role, doctor, patient, connected }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [connected]);

  const logoColorClass =
    role === "patient" ? "text-green-500" : "text-red-500";
  const backgroundClass =
    role === "patient" ? "bg-green-50" : "bg-red-50";

  const otherPersonName =
    role === "doctor"
      ? patient?.name || "Patient"
      : doctor?.name || "Doctor";

  return (
    <nav
      className={`fixed top-0 left-0 w-full ${backgroundClass} backdrop-blur-md border-b shadow-sm z-50`}
    >
      <div className="w-full px-6 py-3 flex items-center justify-between">
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <IoArrowBack
            className="text-2xl cursor-pointer hover:scale-110 transition"
            onClick={() => window.history.back()}
          />

          <div className="flex items-center gap-2">
            <FaUserMd className={`text-2xl ${logoColorClass}`} />
            <span className="text-lg font-bold text-gray-800">
              Aro<span className={logoColorClass}>gyam</span>
            </span>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">
            Video Consultation
          </span>
          <span className="text-md font-semibold text-gray-800">
            {otherPersonName}
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              connected
                ? "text-emerald-700 bg-emerald-100"
                : "text-gray-600 bg-gray-100"
            }`}
          >
            {connected ? "Connected" : "Not Connected"}
          </span>
          <div className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow">
            {connected ? formatDuration(seconds) : "--:--"}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VideoNavbar;