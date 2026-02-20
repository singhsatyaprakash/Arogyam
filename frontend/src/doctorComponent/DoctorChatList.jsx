import React, { useEffect, useState } from "react";
import { useDoctor } from "../contexts/DoctorContext";
import axios from "axios";
import { FaUserMd, FaSearch } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import noProfileImage from "../assets/noProfile.webp";

const DoctorChatList = ({ onSelectPatient }) => {
  const { doctor } = useDoctor();
  const [connectionList, setConnectionList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!doctor?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await axios.post(
          `${import.meta.env.VITE_API_URL}/doctors/getConnectionsList`,
          { doctorId: doctor._id }
        );

        if (result.data.success) {
          setConnectionList(result.data.connections || []);
        } else {
          setError("Failed to fetch connections");
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        setError("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [doctor]);

  // 🔍 Search Filter with null safety
  const filteredConnections = connectionList.filter((c) =>
    c?.patient?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="w-80 h-screen border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b bg-gray-50">
        {/* back button */}
        <IoMdArrowRoundBack
          className="cursor-pointer text-2xl text-gray-700 hover:text-gray-900 transition-colors"
          onClick={() => window.history.back()}
          title="Go back"
        />
        {/* logo */}
        <div className="flex items-center gap-2">
          <FaUserMd className="text-xl text-red-500" />
          <h1 className="text-lg font-bold text-gray-800">
            Aro<span className="text-red-500">gyam</span>
          </h1>
        </div>
      </div>

      {/* search panel */}
      <div className="p-3">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-gray-100 outline-none focus:ring-2 focus:ring-red-400 transition-all"
          />
        </div>
      </div>

      {/* chat list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <p className="text-center text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-500 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <FaSearch className="text-4xl text-gray-300 mb-2" />
            <p className="text-center text-gray-400">
              {search ? "No patients found" : "No chats yet"}
            </p>
          </div>
        ) : (
          filteredConnections.map((c) => (
            <div
              key={c._id}
              onClick={() => onSelectPatient(c)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 hover:shadow-md hover:shadow-red-100 cursor-pointer border-b transition-all duration-200"
            >
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={c.patient?.profileImage || noProfileImage}
                  alt={c.patient?.name || "Patient"}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = noProfileImage;
                  }}
                />
                {/* Online indicator - optional */}
                {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span> */}
              </div>

              {/* Name & Message */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {c.patient?.name || "Unknown Patient"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {c.lastMessage || "No messages yet"}
                </p>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatTime(c.lastActivityAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorChatList;
