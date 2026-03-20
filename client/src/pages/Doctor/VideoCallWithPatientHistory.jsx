import DoctorNavbar from "../../doctorComponent/DoctorNavbar";
import { FaPhone, FaClock, FaUser } from "react-icons/fa";

const VideoCallWithPatientHistory = () => {
    // Sample data - replace with actual API data
    const callHistory = [
        { id: 1, patientName: "John Doe", date: "2024-03-15", duration: "25 mins", status: "Completed" },
        { id: 2, patientName: "Jane Smith", date: "2024-03-14", duration: "30 mins", status: "Completed" },
        { id: 3, patientName: "Mike Johnson", date: "2024-03-13", duration: "15 mins", status: "Completed" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <DoctorNavbar />
            
            {/* Main Content Area */}
            <main className="lg:ml-64 pt-20 lg:pt-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Call History</h1>
                        <p className="text-gray-600">View and manage your video consultation history with patients</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <FaPhone className="text-red-500 text-2xl mr-4" />
                                <div>
                                    <p className="text-gray-600 text-sm">Total Calls</p>
                                    <p className="text-2xl font-bold text-gray-900">24</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <FaClock className="text-blue-500 text-2xl mr-4" />
                                <div>
                                    <p className="text-gray-600 text-sm">Total Duration</p>
                                    <p className="text-2xl font-bold text-gray-900">12h 45m</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <FaUser className="text-green-500 text-2xl mr-4" />
                                <div>
                                    <p className="text-gray-600 text-sm">Unique Patients</p>
                                    <p className="text-2xl font-bold text-gray-900">18</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call History Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Calls</h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {callHistory.map((call) => (
                                        <tr key={call.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-900">{call.patientName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{call.date}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{call.duration}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {call.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                <button className="text-red-600 hover:text-red-900 font-medium">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {callHistory.length === 0 && (
                            <div className="text-center py-12">
                                <FaPhone className="mx-auto text-4xl text-gray-300 mb-3" />
                                <p className="text-gray-500">No video calls yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VideoCallWithPatientHistory;