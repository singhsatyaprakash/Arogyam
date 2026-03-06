import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import noProfileImage from "../assets/noProfile.webp";

const ChatWindow = ({ selectedPatient, onClose }) => {
  const [message, setMessage] = useState("");

  if (!selectedPatient) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-600">
            No Conversation Selected
          </p>
          <p className="text-gray-400">
            Select a patient to start chatting
          </p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Sending:", message);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={selectedPatient.patient?.profileImage || noProfileImage}
            alt={selectedPatient.patient?.name || "Patient"}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              e.target.src = noProfileImage;
            }}
          />
          <div>
            <h2 className="font-semibold text-gray-800">
              {selectedPatient.patient.name}
            </h2>
            <p className="text-xs text-gray-500">{selectedPatient.patient.email}</p>
          </div>
        </div>

        {/*Close Button */}
        <button
          onClick={onClose}
          className="py-2 px-8 rounded-full hover:bg-red-100 active:bg-red-500 transition-colors"
        >
            <IoMdClose className="text-2xl text-black-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 text-center text-gray-400">
        No messages yet
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message..."
          className="flex-1 border px-3 py-2 rounded"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="bg-red-500 text-white px-5 py-2 rounded disabled:bg-gray-300"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default ChatWindow;