import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../contexts/DoctorContext";
import axios from "axios";
import { FaUserMd, FaSearch, FaComments } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import noProfileImage from "../assets/noProfile.webp";

const DoctorChatList = ({ onSelectPatient, selectedConnectionId }) => {
  const { doctor } = useContext(DoctorContext);
  const navigate = useNavigate();
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

  // Search filter with null safety
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
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-red-100 bg-gradient-to-r from-rose-50/90 to-red-50/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/doctor/dashboard", { replace: true })}
            title="Go back"
            className="p-2 rounded-xl hover:bg-white transition"
          >
            <IoMdArrowRoundBack className="text-2xl text-gray-700" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
            <FaUserMd className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-gray-800">
              Aro<span className="text-red-500">gyam</span>
            </h1>
            <p className="text-xs text-gray-600">Chat with Patients</p>
          </div>
        </div>
      </div>

      {/* search panel */}
      <div className="p-3 border-b border-gray-100 bg-white">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition"
          />
        </div>
      </div>

      {/* chat list */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-rose-50/30 px-2 py-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <p className="text-center text-red-500 mb-2 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Retry
            </button>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
            <FaComments className="text-3xl text-rose-200 mb-3" />
            <p className="text-gray-600 font-medium">{search ? "No patients found" : "No chats yet"}</p>
            <p className="text-sm text-gray-400 mt-1">Start a conversation from your appointments.</p>
          </div>
        ) : (
          filteredConnections.map((c) => (
            <div
              key={c._id}
              onClick={() => onSelectPatient(c)}
              className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer border border-transparent rounded-2xl mb-1.5 transition ${
                selectedConnectionId === c._id
                  ? "bg-red-50/90 border-red-200 shadow-sm"
                  : "hover:bg-white hover:border-gray-200"
              }`}
            >
              <img
                src={c.patient?.profileImage || noProfileImage}
                alt={c.patient?.name || "Patient"}
                className="w-12 h-12 rounded-full object-cover border-2 border-red-100"
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

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTime(c.lastActivityAt)}
                </span>
                {c.messageCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
                    {c.messageCount > 99 ? "99+" : c.messageCount}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorChatList;
