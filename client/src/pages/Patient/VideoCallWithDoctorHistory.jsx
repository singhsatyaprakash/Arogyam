import { useEffect, useMemo, useState } from "react";
import PatientNavbar from "../../patientComponent/PatientNavbar";
import { FaVideo, FaClock, FaStethoscope } from "react-icons/fa";
import axios from "axios";

const VideoCallWithDoctorHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalConsultations: 0,
        totalDuration: 0,
        doctorsCount: 0,
    });
    const [statusFilter, setStatusFilter] = useState("completed");

    useEffect(() => {
        const fetchCallHistory = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token") || localStorage.getItem("patientToken");
                if (!token) {
                    setError("Please login again to view consultation history");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/videos/history/patient`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    const sessionData = response.data.data;
                    setHistory(sessionData);

                    // Calculate stats
                    const totalConsultations = sessionData.length;
                    const totalDuration = sessionData.reduce((sum, session) => sum + (session.duration || 0), 0);
                    const uniqueDoctors = new Set(sessionData.map(s => s.doctor?._id)).size;

                    setStats({
                        totalConsultations,
                        totalDuration,
                        doctorsCount: uniqueDoctors,
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

    const getStatusClass = (status) => {
        if (status === "completed") return "bg-emerald-100 text-emerald-800";
        if (status === "ongoing") return "bg-sky-100 text-sky-800";
        return "bg-gray-100 text-gray-700";
    };

    const filteredHistory = useMemo(() => {
        if (statusFilter === "completed") {
            return history.filter((s) => (s?.status || "").toLowerCase() === "completed");
        }
        if (statusFilter === "scheduled") {
            return history.filter((s) => {
                const st = (s?.status || "").toLowerCase();
                return st === "scheduled" || st === "ongoing";
            });
        }
        return history;
    }, [history, statusFilter]);

    const counts = useMemo(() => {
        const completed = history.filter((s) => (s?.status || "").toLowerCase() === "completed").length;
        const scheduled = history.filter((s) => {
            const st = (s?.status || "").toLowerCase();
            return st === "scheduled" || st === "ongoing";
        }).length;
        return {
            completed,
            scheduled,
            all: history.length,
        };
    }, [history]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-cyan-50/60">
            <PatientNavbar />

            {/* Main Content Area */}
            <main className="lg:ml-64 pt-20 lg:pt-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8 rounded-2xl border border-emerald-100 bg-white/90 backdrop-blur p-6 sm:p-7 shadow-sm">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Video Consultation History</h1>
                        <p className="text-gray-600">View all your video consultations with doctors</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-xs rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700">Recent calls</span>
                            <span className="text-xs rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-sky-700">Duration insights</span>
                            <span className="text-xs rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-violet-700">Doctor interactions</span>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                            <div className="flex items-center">
                                <span className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 inline-flex items-center justify-center mr-4">
                                    <FaVideo className="text-xl" />
                                </span>
                                <div>
                                    <p className="text-gray-600 text-sm">Total Consultations</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalConsultations}</p>
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
                                    <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
                            <div className="flex items-center">
                                <span className="h-11 w-11 rounded-xl bg-violet-100 text-violet-700 inline-flex items-center justify-center mr-4">
                                    <FaStethoscope className="text-xl" />
                                </span>
                                <div>
                                    <p className="text-gray-600 text-sm">Doctors Consulted</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.doctorsCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                            <div className="mx-auto h-8 w-8 border-b-2 border-emerald-500 rounded-full animate-spin" />
                            <p className="text-gray-600 mt-3">Loading your consultation history...</p>
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
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Consultations</h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("completed")}
                                        className={`px-3 py-1.5 text-xs rounded-full border font-medium ${
                                            statusFilter === "completed"
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-emerald-300"
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
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Doctor Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Specialty</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredHistory.map((session) => (
                                            <tr key={session._id} className="hover:bg-gray-50/80 transition">
                                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                                    {session.doctor?.name || "Unknown Doctor"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {session.doctor?.specialization || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(session.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDuration(session.duration)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(session.status)}`}
                                                    >
                                                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
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
                                        <FaVideo className="text-2xl" />
                                    </div>
                                    <p className="text-gray-700 font-medium">
                                        {statusFilter === "completed"
                                            ? "No completed video calls yet"
                                            : statusFilter === "scheduled"
                                            ? "No scheduled/later calls"
                                            : "No video consultations yet"}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {statusFilter === "completed"
                                            ? "Completed consultation records will appear here."
                                            : statusFilter === "scheduled"
                                            ? "Upcoming or ongoing calls will appear in this section."
                                            : "Your video consultations will appear here."}
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

export default VideoCallWithDoctorHistory;