import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../contexts/DoctorContext";
import axios from "axios";
import { FaUserMd, FaSearch } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import noProfileImage from "../assets/noProfile.webp";

const DoctorChatList = ({ onSelectPatient, selectedConnectionId }) => {
  const { doctor } = useContext(DoctorContext);
  const [connectionList, setConnectionList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!doctor?.doctor?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await axios.post(
          `${import.meta.env.VITE_API_URL}/doctors/getConnectionsList`,
          { doctorId: doctor.doctor._id }
        );

        if (result.data?.success) {
          setConnectionList(result.data?.connections || []);
        } else if (result.data?.data?.connections) {
          setConnectionList(result.data.data.connections);
        } else {
          setConnectionList([]);
          setError("Failed to fetch connections");
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        setConnectionList([]);
        setError("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [doctor?.doctor?._id]);

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
      <div className="p-5 border-b bg-red-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            title="Go back"
            className="p-1 rounded-full hover:bg-red-100 transition"
          >
            <IoMdArrowRoundBack className="text-2xl text-gray-700" />
          </button>
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <FaUserMd className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">
            Aro<span className="text-red-500">gyam</span>
            </h1>
            <p className="text-xs text-gray-600">Chat with Patients</p>
          </div>
        </div>
      </div>

      {/* search panel */}
      <div className="p-3 border-b">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm outline-none"
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
            <p className="text-center text-red-500 mb-2 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Retry
            </button>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 px-4 text-center">
            {search ? "No patients found" : "No chats yet"}
          </div>
        ) : (
          filteredConnections.map((c) => (
            <div
              key={c._id}
              onClick={() => onSelectPatient(c)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b ${
                selectedConnectionId === c._id
                  ? "bg-red-50 border-l-4 border-l-red-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <img
                src={c.patient?.profileImage || noProfileImage}
                alt={c.patient?.name || "Patient"}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = noProfileImage;
                }}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {c.patient?.name || "Unknown Patient"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {c.messageCount > 0
                    ? `${c.messageCount} messages`
                    : c.lastMessage || "No messages yet"}
                </p>
              </div>

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
