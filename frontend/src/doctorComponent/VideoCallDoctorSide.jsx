import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VideoConsultationRoom from "../component/VideoConsultationRoom";

const VideoCallDoctorSide = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { role, session, appointment, doctor, patient } = location.state || {};

  if (!session || !appointment || !doctor || !patient) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">Call details are missing. Please rejoin from the lobby.</p>
        <button
          onClick={() => navigate("/doctor/video-calls")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back To Video Calls
        </button>
      </div>
    );
  }

  return (
    <>
      <VideoConsultationRoom
        role={role}
        session={session}
        appointment={appointment}
        doctor={doctor}
        patient={patient}
      />
    </>
  );
};

export default VideoCallDoctorSide;