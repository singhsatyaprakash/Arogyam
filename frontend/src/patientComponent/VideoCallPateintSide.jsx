import React from "react";
import { useLocation } from "react-router-dom";
import VideoConsultationRoom from "../component/VideoConsultationRoom";

const VideoCallPateintSide = () => {
  const location = useLocation();
  const { appointment, session, doctor, patient } = location.state || {};

  return (
    <VideoConsultationRoom
      role="patient"
      appointment={appointment}
      session={session}
      doctor={doctor}
      patient={patient}
    />
  );
};

export default VideoCallPateintSide;
