import React, { useState } from "react";
import DoctorChatList from "../../doctorComponent/DoctorChatList";
import ChatWindow from "../../doctorComponent/ChatWindow";

const ChatWithPatient = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

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
          onClose={() => setSelectedPatient(null)}
        />
      </div>

      </div>
    </div>
  );
};

export default ChatWithPatient;