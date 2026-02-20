import PatientNavbar from "../../patientComponent/PatientNavbar";

const ChatWithDoctor = () => {
  return (
    <>
      <PatientNavbar/>
      {/* Main content area with proper margins for navbar */}
      <div className="lg:ml-64 min-h-screen bg-gray-50">
        {/* Container with padding and top margin for mobile topbar */}
        <div className="pt-4 lg:pt-8 px-4 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Doctor Chats</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">This is patient side chat interface</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWithDoctor;