import PatientChatList from "../../patientComponent/PatientChatList";
import PatientChatWindow from "../../patientComponent/PatientChatWindow";
import { useState } from "react";

const ChatWithDoctor = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 border-r border-gray-300">
        <PatientChatList onSelectDoctor={setSelectedDoctor} />
      </div>

      <div className="flex-1">
        <PatientChatWindow 
          selectedDoctor={selectedDoctor} 
          onClose={() => setSelectedDoctor(null)}
        />
      </div>
    </div>
  );
}

export default ChatWithDoctor;