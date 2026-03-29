import { useEffect, useMemo, useState } from "react";
import DoctorNavbar from "../../doctorComponent/DoctorNavbar";
import { FaPhone, FaClock, FaUser } from "react-icons/fa";
import axios from "axios";

const VideoCallWithPatientHistory = () => {
    const [callHistory, setCallHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalCalls: 0,
        totalDuration: 0,
        uniquePatients: 0,
    });
    const [statusFilter, setStatusFilter] = useState("completed");

    useEffect(() => {
        const fetchCallHistory = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token") || localStorage.getItem("doctorToken");
                if (!token) {
                    setError("Please login again to view call history");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/videos/history/doctor`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    const sessionData = response.data.data;
                    setCallHistory(sessionData);

                    // Calculate stats
                    const totalCalls = sessionData.length;
                    const totalDuration = sessionData.reduce((sum, session) => sum + (session.duration || 0), 0);
                    const uniquePatients = new Set(sessionData.map(s => s.patient?._id)).size;

                    setStats({
                        totalCalls,
                        totalDuration,
                        uniquePatients,
                    });
                }
            } catch (err) {
                console.error("Error fetching video history:", err);
                setError(err.response?.data?.message || "Failed to load video history");
            } finally {
                setLoading(false);
            }
        };

        fetchCallHistory();
    }, []);

    const formatDuration = (seconds) => {
        if (!seconds) return "0 mins";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} mins`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getTotalDurationFormatted = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getStatusClass = (status) => {
        if (status === "completed") return "bg-rose-100 text-rose-800";
        if (status === "ongoing") return "bg-sky-100 text-sky-800";
        return "bg-gray-100 text-gray-700";
    };

    const filteredHistory = useMemo(() => {
        if (statusFilter === "completed") {
            return callHistory.filter((s) => (s?.status || "").toLowerCase() === "completed");
        }
        if (statusFilter === "scheduled") {
            return callHistory.filter((s) => {
                const st = (s?.status || "").toLowerCase();
                return st === "scheduled" || st === "ongoing";
            });
        }
        return callHistory;
    }, [callHistory, statusFilter]);

    const counts = useMemo(() => {
        const completed = callHistory.filter((s) => (s?.status || "").toLowerCase() === "completed").length;
        const scheduled = callHistory.filter((s) => {
            const st = (s?.status || "").toLowerCase();
            return st === "scheduled" || st === "ongoing";
        }).length;
        return {
            completed,
            scheduled,
            all: callHistory.length,
        };
    }, [callHistory]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/70 via-white to-orange-50/60">
            <DoctorNavbar />

            {/* Main Content Area */}
            <main className="lg:ml-64 pt-20 lg:pt-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8 rounded-2xl border border-rose-100 bg-white/90 backdrop-blur p-6 sm:p-7 shadow-sm">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Video Call History</h1>
                        <p className="text-gray-600">View and manage your video consultation history with patients</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-xs rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-rose-700">Recent calls</span>
                            <span className="text-xs rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-sky-700">Duration insights</span>
                            <span className="text-xs rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-amber-700">Patient interactions</span>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
                            <div className="flex items-center">
                                <span className="h-11 w-11 rounded-xl bg-rose-100 text-rose-700 inline-flex items-center justify-center mr-4">
                                    <FaPhone className="text-xl" />
                                </span>
                                <div>
                                    <p className="text-gray-600 text-sm">Total Calls</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalCalls}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
                            <div className="flex items-center">
                                <span className="h-11 w-11 rounded-xl bg-sky-100 text-sky-700 inline-flex items-center justify-center mr-4">
                                    <FaClock className="text-xl" />
                                </span>
                                <div>
                                    <p className="text-gray-600 text-sm">Total Duration</p>
                                    <p className="text-2xl font-bold text-gray-900">{getTotalDurationFormatted(stats.totalDuration)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
                            <div className="flex items-center">
                                <span className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 inline-flex items-center justify-center mr-4">
                                    <FaUser className="text-xl" />
                                </span>
                                <div>
                                    <p className="text-gray-600 text-sm">Unique Patients</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.uniquePatients}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                            <div className="mx-auto h-8 w-8 border-b-2 border-rose-500 rounded-full animate-spin" />
                            <p className="text-gray-600 mt-3">Loading your call history...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 shadow-sm">
                            <p className="text-rose-700">{error}</p>
                        </div>
                    )}

                    {/* Call History Table */}
                    {!loading && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-orange-50">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Calls</h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("completed")}
                                        className={`px-3 py-1.5 text-xs rounded-full border font-medium ${
                                            statusFilter === "completed"
                                                ? "bg-rose-600 text-white border-rose-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-rose-300"
                                        }`}
                                    >
                                        Completed ({counts.completed})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("scheduled")}
                                        className={`px-3 py-1.5 text-xs rounded-full border font-medium ${
                                            statusFilter === "scheduled"
                                                ? "bg-sky-600 text-white border-sky-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-sky-300"
                                        }`}
                                    >
                                        Scheduled/Later ({counts.scheduled})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("all")}
                                        className={`px-3 py-1.5 text-xs rounded-full border font-medium ${
                                            statusFilter === "all"
                                                ? "bg-gray-800 text-white border-gray-800"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                                        }`}
                                    >
                                        All ({counts.all})
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredHistory.map((call) => (
                                            <tr key={call._id} className="hover:bg-gray-50/80 transition">
                                                <td className="px-6 py-4 text-sm text-gray-900">{call.patient?.name || "Unknown Patient"}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(call.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDuration(call.duration)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(call.status)}`}
                                                    >
                                                        {(call.status || "unknown").charAt(0).toUpperCase() + (call.status || "unknown").slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {filteredHistory.length === 0 && !loading && (
                                <div className="text-center py-14 px-6">
                                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                                        <FaPhone className="text-2xl" />
                                    </div>
                                    <p className="text-gray-700 font-medium">
                                        {statusFilter === "completed"
                                            ? "No completed video calls yet"
                                            : statusFilter === "scheduled"
                                            ? "No scheduled/later calls"
                                            : "No video calls yet"}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {statusFilter === "completed"
                                            ? "Completed call records will appear here."
                                            : statusFilter === "scheduled"
                                            ? "Upcoming or ongoing calls will appear in this section."
                                            : "Your video calls will appear here."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VideoCallWithPatientHistory;