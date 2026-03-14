import DoctorNavbar from "../../doctorComponent/DoctorNavbar";

const VideoCallWithPatientHistory = () => {
    return (
        <div>
            <DoctorNavbar/>
            <h1 className="text-2xl font-bold mb-4">Video Call History with Patients</h1>
            <p className="text-gray-600">This page will display the history of your video calls with patients, including details such as date, patient name, and call duration.</p>
            {/* You can add a table or list here to show the video call history */}
        </div>
    );
};

export default VideoCallWithPatientHistory;