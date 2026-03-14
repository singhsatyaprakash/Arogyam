import React, { useContext, useEffect, useState } from "react";
import { PatientContext } from "../contexts/PatientContext";
import axios from "axios";
import { FaUserMd, FaSearch } from "react-icons/fa";
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
    <div className="w-80 h-screen border-r bg-white flex flex-col">
      {/* Header */}
      <div className="p-5 border-b bg-green-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            title="Go back"
            className="p-1 rounded-full hover:bg-green-100 transition"
          >
            <IoMdArrowRoundBack className="text-2xl text-gray-700" />
          </button>
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <FaUserMd className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">
              Aro<span className="text-green-500">gyam</span>
            </h1>
            <p className="text-xs text-gray-600">Chat with Doctors</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-6 w-6 border-b-2 border-green-500 rounded-full"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No chats found
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c._id}
              onClick={() => handleSelect(c)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b ${
                selectedId === c._id
                  ? "bg-green-50 border-l-4 border-l-green-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <img
                src={c.doctor?.profileImage || noProfileImage}
                alt="doctor"
                className="w-12 h-12 rounded-full object-cover"
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

              <div className="text-xs text-gray-400">
                {formatTime(c.lastActivityAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientChatList;