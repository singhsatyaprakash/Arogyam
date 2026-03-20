import React, { useEffect, useRef, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import VideocamIcon from "@mui/icons-material/Videocam";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";

export const VideoFunctionality = ({ role, onEndCall }) => {
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef(null);

  const resetControlsTimer = () => {
    setShowControls(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 10000);
  };

  useEffect(() => {
    resetControlsTimer();

    window.addEventListener("mousemove", resetControlsTimer);

    return () => {
      window.removeEventListener("mousemove", resetControlsTimer);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <footer
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0f1a23]/85 backdrop-blur-md border border-white/10 shadow-2xl">
        <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
          <MoreHorizIcon fontSize="medium" />
        </button>

        {role === "doctor" && (
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
            <MedicalInformationIcon fontSize="medium" />
          </button>
        )}

        <button className="w-12 h-12 rounded-full bg-white text-black hover:scale-105 flex items-center justify-center transition">
          <VideocamIcon fontSize="medium" />
        </button>

        <button className="w-12 h-12 rounded-full bg-white text-black hover:scale-105 flex items-center justify-center transition">
          <VolumeUpIcon fontSize="medium" />
        </button>

        <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
          <MicOffIcon fontSize="medium" />
        </button>

        <button
          onClick={onEndCall}
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition"
        >
          <CallEndIcon fontSize="medium" />
        </button>
      </div>
    </footer>
  );
};