import React, { useState, useEffect, useRef } from "react";
import noProfileImage from "../assets/noProfile.webp";

const PatientChatWindow = ({ selectedDoctor }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedDoctor) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Select a doctor to start chatting
      </div>
    );
  }

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: message,
      sender: "patient",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center gap-4">
        <img
          src={selectedDoctor.doctor?.profileImage || noProfileImage}
          alt="doctor"
          className="w-12 h-12 rounded-full"
          onError={(e) => (e.target.src = noProfileImage)}
        />
        <div>
          <h2 className="font-bold">
            {selectedDoctor.doctor?.name}
          </h2>
          <p className="text-sm text-green-600">Active</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center">
            Start your conversation
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "patient"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg ${
                msg.sender === "patient"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          className="flex-1 border px-3 py-2 rounded-md outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-4 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PatientChatWindow;