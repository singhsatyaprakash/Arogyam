import React, { useContext, useEffect, useState } from "react";
import { PatientContext } from "../contexts/PatientContext";
import axios from "axios";
import { FaUserMd, FaSearch, FaComments } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import noProfileImage from "../assets/noProfile.webp";

const PatientChatList = ({ onSelectDoctor }) => {
  const { patient } = useContext(PatientContext);
  const [connectionList, setConnectionList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!patient?.patient?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await axios.post(
          `${import.meta.env.VITE_API_URL}/patients/getConnectionsList`,
          { patientId: patient.patient._id }
        );

        if (result.data?.data?.connections) {
          setConnectionList(result.data.data.connections);
        } else {
          setConnectionList([]);
        }
      } catch (err) {
        console.error(err);
        setConnectionList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [patient?.patient?._id]);

  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filtered = connectionList.filter((c) =>
    c?.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (connection) => {
    setSelectedId(connection._id);
    onSelectDoctor(connection);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-cyan-50/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            title="Go back"
            className="p-2 rounded-xl hover:bg-white transition"
          >
            <IoMdArrowRoundBack className="text-2xl text-gray-700" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
            <FaUserMd className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-gray-800">
              Aro<span className="text-emerald-500">gyam</span>
            </h1>
            <p className="text-xs text-gray-600">Chat with Doctors</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100 bg-white">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-emerald-50/30 px-2 py-2">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-7 w-7 border-b-2 border-emerald-500 rounded-full"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6 text-center">
            <FaComments className="text-3xl text-emerald-200 mb-3" />
            <p className="text-gray-600 font-medium">No chats found</p>
            <p className="text-sm text-gray-400 mt-1">Try searching a doctor or start a new consultation.</p>
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c._id}
              onClick={() => handleSelect(c)}
              className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer border border-transparent rounded-2xl mb-1.5 transition ${
                selectedId === c._id
                  ? "bg-emerald-50/90 border-emerald-200 shadow-sm"
                  : "hover:bg-white hover:border-gray-200"
              }`}
            >
              <img
                src={c.doctor?.profileImage || noProfileImage}
                alt="doctor"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
                onError={(e) => (e.target.src = noProfileImage)}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {c.doctor?.name || "Unknown Doctor"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {c.messageCount > 0
                    ? `${c.messageCount} messages`
                    : "No messages yet"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="text-xs text-gray-400">
                  {formatTime(c.lastActivityAt)}
                </div>
                {c.messageCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">
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

export default PatientChatList;