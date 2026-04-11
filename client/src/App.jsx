import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Careers from "./pages/Careers.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndCondition from "./pages/TermsAndCondition";

import PatientProtectedWrapper from "./ProtectWrapper/PatientProtectedWrapper";
import PatientRegister from "./pages/Patient/PatientRegister";
import PatientDashboard from "./pages/Patient/PatientDashboard";
import AppointmentBooking from "./pages/Patient/AppointmentBooking";
import DoctorBookingProcess from "./pages/Patient/DoctorBookingProcess";
import ChatPayment from "./component/ChatPayment";
import ChatWithDoctor from "./pages/Patient/ChatWithDoctor";
import Payment from "./component/Payment";
import BookedAppointment from "./pages/Patient/BookedAppointment";
import PatientVideoCallLobby from "./pages/Patient/PatientVideoCallLobby";
import VideoCallPateintSide from "./patientComponent/VideoCallPateintSide";
import VideoCallWithDoctorHistory from "./pages/Patient/VideoCallWithDoctorHistory";


import DoctorProtectedWrapper from "./ProtectWrapper/DoctorProtectedWrapper";
import DoctorRegister from "./pages/Doctor/DoctorRegister";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import ChatWithPatient from "./pages/Doctor/ChatWithPatient";
import Appointments from "./pages/Doctor/Appointments";
import DoctorVideoCallLobby from "./pages/Doctor/DoctorVideoCallLobby";
import VideoCallDoctorSide from "./doctorComponent/VideoCallDoctorSide";
import VideoCallWithPatientHistory from "./pages/Doctor/VideoCallWithPatientHistory";
import PatientReviews from "./pages/Patient/PatientReviews.jsx";

import Medicines from "./pages/Doctor/Medicines";
import Notes from "./pages/Doctor/Notes";
import CaseStudies from "./pages/Doctor/CaseStudies";
import ShareIdeas from "./pages/Doctor/ShareIdeas";
import Settings from "./pages/Doctor/Settings";
import DailyRoutinePatient from "./pages/Patient/DailyRoutinePatient.jsx";
import OTPVerification from "./component/OTPVerification";

// import VerifyEmailPage from "./component/VerifyEmailPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndCondition />} />
        <Route path="/careers" element={<Careers />} />

        {/* patient routes */}
        <Route path="/register/patient" element={<PatientRegister />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/patient/dashboard" element={<PatientProtectedWrapper><PatientDashboard /></PatientProtectedWrapper>} />
        <Route path="/patient/appointments" element={<PatientProtectedWrapper><AppointmentBooking /></PatientProtectedWrapper>} />
        <Route path="/patient/chat-payment" element={<PatientProtectedWrapper><ChatPayment /></PatientProtectedWrapper>} />
        <Route path="/patient/chats" element={<PatientProtectedWrapper><ChatWithDoctor /></PatientProtectedWrapper>} />
        <Route path="/patient/payment" element={<PatientProtectedWrapper><Payment /></PatientProtectedWrapper>} />
        <Route path="/patient/booked-appointment" element={<PatientProtectedWrapper><BookedAppointment /></PatientProtectedWrapper>} />
        <Route path="/patient/video-call-lobby/:appointmentId" element={<PatientProtectedWrapper><PatientVideoCallLobby /></PatientProtectedWrapper>} />
        <Route path="/patient/video-call/:sessionId" element={<PatientProtectedWrapper><VideoCallPateintSide /></PatientProtectedWrapper>} />
        <Route path="/patient/video-calls" element={<PatientProtectedWrapper><VideoCallWithDoctorHistory/></PatientProtectedWrapper>} />
        <Route path="/patient/reviews" element={<PatientProtectedWrapper><PatientReviews/></PatientProtectedWrapper>} />
        <Route path="/patient/daily-routine" element={<PatientProtectedWrapper><DailyRoutinePatient /></PatientProtectedWrapper>} />



        {/* doctor routes */}
        <Route path="/register/doctor" element={<DoctorRegister />} />
        <Route path="/doctor/dashboard" element={<DoctorProtectedWrapper><DoctorDashboard /></DoctorProtectedWrapper>} />
        <Route path="/patient/doctor/:doctorId/book" element={<PatientProtectedWrapper><DoctorBookingProcess /></PatientProtectedWrapper>} />
        <Route path="/doctor/chats" element={<DoctorProtectedWrapper><ChatWithPatient /></DoctorProtectedWrapper>} />
        <Route path="/doctor/appointments" element={<DoctorProtectedWrapper><Appointments /></DoctorProtectedWrapper>} />
        <Route path="/doctor/video-call-lobby/:appointmentId" element={<DoctorProtectedWrapper><DoctorVideoCallLobby /></DoctorProtectedWrapper>} />
        <Route path="/doctor/video-call/:roomId" element={<DoctorProtectedWrapper><VideoCallDoctorSide/></DoctorProtectedWrapper>} />
        {/* <Route path="/doctor/video-call/:sessionId" element={<DoctorProtectedWrapper><VideoCallDoctorSide/></DoctorProtectedWrapper>} /> */}
        <Route path="/doctor/video-calls" element={<DoctorProtectedWrapper><VideoCallWithPatientHistory/></DoctorProtectedWrapper>} />


        
        <Route path="/doctor/medicines" element={<DoctorProtectedWrapper><Medicines /></DoctorProtectedWrapper>} />
        <Route path="/doctor/notes" element={<DoctorProtectedWrapper><Notes /></DoctorProtectedWrapper>} />
        <Route path="/doctor/case-studies" element={<DoctorProtectedWrapper><CaseStudies /></DoctorProtectedWrapper>} />
        <Route path="/doctor/share-ideas" element={<DoctorProtectedWrapper><ShareIdeas /></DoctorProtectedWrapper>} />
        <Route path="/doctor/settings" element={<DoctorProtectedWrapper><Settings /></DoctorProtectedWrapper>} />
        {/* <Route path="/verify-email" element={<VerifyEmailPage />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;