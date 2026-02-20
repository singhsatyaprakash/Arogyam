import React, { useState } from "react";
import DoctorChatList from "../../doctorComponent/DoctorChatList";
import ChatWindow from "../../doctorComponent/ChatWindow";

const ChatWithPatient = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <DoctorChatList onSelectPatient={setSelectedPatient} />

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