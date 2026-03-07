import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import PatientProtectedWrapper from "./ProtectWrapper/PatientProtectedWrapper";
import PatientRegister from "./pages/Patient/PatientRegister";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import AppointmentBooking from "./pages/Patient/AppointmentBooking";
import DoctorBookingProcess from "./pages/Patient/DoctorBookingProcess";
import ChatPayment from "./component/ChatPayment";
import ChatWithDoctor from "./pages/Patient/ChatWithDoctor";
import Payment from "./component/Payment";
import BookedAppointment from "./pages/Patient/BookedAppointment";


import DoctorProtectedWrapper from "./ProtectWrapper/DoctorProtectedWrapper";
import DoctorRegister from "./pages/Doctor/DoctorRegister";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import ChatWithPatient from "./pages/Doctor/ChatWithPatient";
import Appointments from "./pages/Doctor/Appointments";

// import OnePatientChat from "./pages/Doctor/OnePatientChat";
// import VideoSessionManagement from "./pages/Doctor/VideoSessionManagement";
// import VideoCall from "./doctorComponent/VideoCall";
// import Medicines from "./pages/Doctor/Medicines";
// import Notes from "./pages/Doctor/Notes";
// import CaseStudies from "./pages/Doctor/CaseStudies";
// import ShareIdeas from "./pages/Doctor/ShareIdeas";
// import PatientProtectedWrapper from "./ProtectWrapper/PatientProtectedWrapper";
// import Settings from "./pages/Doctor/Settings";
// import VerifyEmailPage from "./component/VerifyEmailPage";
// import PatientVideoCall from "./pages/Patient/PatientVideoCall";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* patient routes */}
        <Route path="/register/patient" element={<PatientRegister />} />
        <Route path="/patient/dashboard" element={<PatientProtectedWrapper><PatientDashboard /></PatientProtectedWrapper>} />
        <Route path="/patient/appointments" element={<PatientProtectedWrapper><AppointmentBooking /></PatientProtectedWrapper>} />
        <Route path="/patient/chat-payment" element={<PatientProtectedWrapper><ChatPayment /></PatientProtectedWrapper>} />
        <Route path="/patient/chats" element={<PatientProtectedWrapper><ChatWithDoctor /></PatientProtectedWrapper>} />
        <Route path="/patient/payment" element={<PatientProtectedWrapper><Payment /></PatientProtectedWrapper>} />
        <Route path="/patient/booked-appointment" element={<PatientProtectedWrapper><BookedAppointment /></PatientProtectedWrapper>} />



        {/* doctor routes */}
        <Route path="/register/doctor" element={<DoctorRegister />} />
        <Route path="/doctor/dashboard" element={<DoctorProtectedWrapper><DoctorDashboard /></DoctorProtectedWrapper>} />
        <Route path="/patient/doctor/:doctorId/book" element={<PatientProtectedWrapper><DoctorBookingProcess /></PatientProtectedWrapper>} />
        <Route path="/doctor/chats" element={<DoctorProtectedWrapper><ChatWithPatient /></DoctorProtectedWrapper>} />
        <Route path="/doctor/appointments" element={<DoctorProtectedWrapper><Appointments /></DoctorProtectedWrapper>} />


        {/* <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route path="/doctor/video-sessions" element={<DoctorProtectedWrapper><VideoSessionManagement /></DoctorProtectedWrapper>} />
        <Route path="/doctor/video-call/:sessionId" element={<DoctorProtectedWrapper><VideoCall /></DoctorProtectedWrapper>} />
        <Route path="/doctor/medicines" element={<DoctorProtectedWrapper><Medicines /></DoctorProtectedWrapper>} />
        <Route path="/doctor/notes" element={<DoctorProtectedWrapper><Notes /></DoctorProtectedWrapper>} />
        <Route path="/doctor/case-studies" element={<DoctorProtectedWrapper><CaseStudies /></DoctorProtectedWrapper>} />
        <Route path="/doctor/share-ideas" element={<DoctorProtectedWrapper><ShareIdeas /></DoctorProtectedWrapper>} />
        <Route path="/doctor/settings" element={<DoctorProtectedWrapper><Settings /></DoctorProtectedWrapper>} /> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;