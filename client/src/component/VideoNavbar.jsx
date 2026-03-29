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
  const navbarBgClass =
    role === "patient" ? "bg-green-50" : "bg-red-50";
  const accentBgClass =
    role === "patient" ? "bg-green-50" : "bg-red-50";

  const otherPersonName =
    role === "doctor"
      ? patient?.name || "Patient"
      : doctor?.name || "Doctor";

  return (
    <nav className={`fixed top-0 left-0 w-full border-b border-gray-200 ${navbarBgClass} shadow-sm z-50`}>
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <IoArrowBack
            className="text-xl sm:text-2xl cursor-pointer text-gray-700 hover:text-gray-900 hover:scale-105 transition"
            onClick={() => window.history.back()}
          />

          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl ${accentBgClass}`}>
            <FaUserMd className={`text-xl ${logoColorClass}`} />
            <span className="text-base lg:text-lg font-bold text-gray-800">
              Aro<span className={logoColorClass}>gyam</span>
            </span>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center min-w-0 flex-1 px-1">
          <span className="text-[11px] sm:text-xs uppercase tracking-wide text-gray-500">
            Video Consultation
          </span>
          <span className="text-sm sm:text-base font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-[260px] lg:max-w-none">
            {otherPersonName}
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span
            className={`text-[11px] sm:text-xs font-medium px-2 py-1 rounded-full border ${
              connected
                ? "text-emerald-700 bg-emerald-100 border-emerald-200"
                : "text-gray-600 bg-white/70 border-gray-200"
            }`}
          >
            {connected ? "Connected" : "Waiting"}
          </span>
          <div className="text-xs sm:text-sm font-semibold text-gray-700 bg-white/70 border border-gray-200 px-2.5 sm:px-3 py-1 rounded-full">
            {connected ? formatDuration(seconds) : "--:--"}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VideoNavbar;