import React, { useEffect, useState } from "react";
import DoctorChatList from "../../doctorComponent/DoctorChatList";
import ChatWindow from "../../doctorComponent/ChatWindow";
import { useNavigate } from "react-router-dom";

const ChatWithPatient = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      navigate("/doctor/dashboard", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  return (
    <div className="h-screen bg-gradient-to-br from-rose-100/40 via-white to-orange-100/30 p-0 md:p-4">
      <div className="h-full md:rounded-3xl border border-rose-100/70 bg-white/95 shadow-xl overflow-hidden flex backdrop-blur-sm">

      {/* Sidebar */}
      <div className={`${selectedPatient ? "hidden md:block" : "block"} w-full md:w-[340px] lg:w-[380px] border-r border-gray-200`}>
        <DoctorChatList
          onSelectPatient={setSelectedPatient}
          selectedConnectionId={selectedPatient?._id || null}
        />
      </div>

      {/* Chat Window */}
      <div className={`${selectedPatient ? "block" : "hidden md:block"} flex-1 min-w-0`}>
        <ChatWindow
          selectedPatient={selectedPatient}
          onClose={() => navigate("/doctor/dashboard", { replace: true })}
        />
      </div>

      </div>
    </div>
  );
};

export default ChatWithPatient;