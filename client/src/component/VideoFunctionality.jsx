import React, { useEffect, useRef, useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

export const VideoFunctionality = ({ role, onEndCall, onToggleFullscreen, isFullscreen }) => {
  const [showControls, setShowControls] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isOnHold, setIsOnHold] = useState(false);
  const hideTimerRef = useRef(null);

  const iconButtonBase =
    "flex items-center justify-center rounded-full transition duration-200";
  const softButton =
    `${iconButtonBase} w-11 h-11 sm:w-12 sm:h-12 bg-white/10 text-white border border-white/10 hover:bg-white/20`;
  const solidButton =
    `${iconButtonBase} w-11 h-11 sm:w-12 sm:h-12 bg-white text-gray-900 hover:scale-105 shadow-sm`;
  const activeToggleButton =
    `${iconButtonBase} w-11 h-11 sm:w-12 sm:h-12 bg-white text-gray-900 hover:scale-105 shadow-sm`;
  const inactiveToggleButton =
    `${iconButtonBase} w-11 h-11 sm:w-12 sm:h-12 bg-white/10 text-white border border-white/10 hover:bg-white/20`;

  const resetControlsTimer = () => {
    setShowControls(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 10000);
  };

  const startAutoHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 10000);
  };

  useEffect(() => {
    startAutoHideTimer();

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
      className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#0f1a23]/80 backdrop-blur-xl border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
        <button className={softButton}>
          <MoreHorizIcon fontSize="medium" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className={isFullscreen ? inactiveToggleButton : softButton}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <FullscreenExitIcon fontSize="medium" />
          ) : (
            <FullscreenIcon fontSize="medium" />
          )}
        </button>

        {role === "doctor" && (
          <button className={softButton}>
            <MedicalInformationIcon fontSize="medium" />
          </button>
        )}

        <button
          onClick={() => setIsOnHold((prev) => !prev)}
          className={isOnHold ? inactiveToggleButton : solidButton}
          title={isOnHold ? "Resume Call" : "Hold Call"}
        >
          {isOnHold ? (
            <PlayCircleFilledIcon fontSize="medium" />
          ) : (
            <PauseCircleFilledIcon fontSize="medium" />
          )}
        </button>

        <button
          onClick={() => setIsVideoOn((prev) => !prev)}
          className={isVideoOn ? activeToggleButton : inactiveToggleButton}
          title={isVideoOn ? "Turn Video Off" : "Turn Video On"}
        >
          {isVideoOn ? <VideocamIcon fontSize="medium" /> : <VideocamOffIcon fontSize="medium" />}
        </button>

        <button
          onClick={() => setIsSpeakerOn((prev) => !prev)}
          className={isSpeakerOn ? activeToggleButton : inactiveToggleButton}
          title={isSpeakerOn ? "Mute Speaker" : "Unmute Speaker"}
        >
          {isSpeakerOn ? <VolumeUpIcon fontSize="medium" /> : <VolumeOffIcon fontSize="medium" />}
        </button>

        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className={isMuted ? inactiveToggleButton : activeToggleButton}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOffIcon fontSize="medium" /> : <MicIcon fontSize="medium" />}
        </button>

        <button
          onClick={onEndCall}
          className={`${iconButtonBase} w-11 h-11 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 text-white border border-red-400/50 shadow-sm`}
        >
          <CallEndIcon fontSize="medium" />
        </button>
      </div>
    </footer>
  );
};