import React, { useState } from "react";
import DoctorChatList from "../../doctorComponent/DoctorChatList";
import ChatWindow from "../../doctorComponent/ChatWindow";

const ChatWithPatient = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-80 border-r border-gray-300">
        <DoctorChatList
          onSelectPatient={setSelectedPatient}
          selectedConnectionId={selectedPatient?._id || null}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        <ChatWindow
          selectedPatient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      </div>

    </div>
  );
};

export default ChatWithPatient;