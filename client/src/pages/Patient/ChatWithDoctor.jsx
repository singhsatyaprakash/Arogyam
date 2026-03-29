import PatientChatList from "../../patientComponent/PatientChatList";
import PatientChatWindow from "../../patientComponent/PatientChatWindow";
import { useState } from "react";

const ChatWithDoctor = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-100/40 via-white to-cyan-100/40 p-0 md:p-4">
      <div className="h-full md:rounded-3xl border border-emerald-100/70 bg-white/95 shadow-xl overflow-hidden flex backdrop-blur-sm">
        <div className={`${selectedDoctor ? "hidden md:block" : "block"} w-full md:w-[340px] lg:w-[380px] border-r border-gray-200 bg-white`}>
          <PatientChatList onSelectDoctor={setSelectedDoctor} />
        </div>

        <div className={`${selectedDoctor ? "block" : "hidden md:block"} flex-1 min-w-0`}>
          <PatientChatWindow
            selectedDoctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatWithDoctor;