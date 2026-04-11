import PatientChatList from "../../patientComponent/PatientChatList";
import PatientChatWindow from "../../patientComponent/PatientChatWindow";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatWithDoctor = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      navigate("/patient/dashboard", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-100/40 via-white to-cyan-100/40 p-0 md:p-4">
      <div className="h-full md:rounded-3xl border border-emerald-100/70 bg-white/95 shadow-xl overflow-hidden flex backdrop-blur-sm">
        <div className={`${selectedDoctor ? "hidden md:block" : "block"} w-full md:w-[340px] lg:w-[380px] border-r border-gray-200 bg-white`}>
          <PatientChatList onSelectDoctor={setSelectedDoctor} />
        </div>

        <div className={`${selectedDoctor ? "block" : "hidden md:block"} flex-1 min-w-0`}>
          <PatientChatWindow
            selectedDoctor={selectedDoctor}
            onClose={() => navigate("/patient/dashboard", { replace: true })}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatWithDoctor;