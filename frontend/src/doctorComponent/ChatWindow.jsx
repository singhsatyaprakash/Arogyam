import React, { useState, useEffect, useRef, useContext } from "react";
import { IoMdClose } from "react-icons/io";
import { useSocket } from "../contexts/SocketContext";
import { DoctorContext } from "../contexts/DoctorContext";
import noProfileImage from "../assets/noProfile.webp";

const ChatWindow = ({ selectedPatient, onClose }) => {

  const socket = useSocket();
  const { doctor } = useContext(DoctorContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  // Load chat history and join room
  useEffect(() => {
    if (!selectedPatient || !socket) return;

    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/chats/history/${selectedPatient._id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.data?.messages) {
            setMessages(data.data.messages);
          }
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    loadChatHistory();

    const connectionId = selectedPatient._id;
    socket.emit("join_chat", { connectionId });

    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedPatient, socket]);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = () => {
    if (!message.trim() || !socket) return;

    const msgData = {
      connectionId: selectedPatient._id,
      senderId: doctor.doctor._id,
      senderType: "doctor",
      text: message
    };

    socket.emit("send_message", msgData);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
            alt="patient"
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            onError={(e)=> e.target.src=noProfileImage}
          />

          <div>
            <h2 className="font-semibold text-gray-800">
              {selectedPatient.patient?.name}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedPatient.patient?.email}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="py-2 px-4 rounded-full hover:bg-red-100 transition"
        >
          <IoMdClose className="text-2xl"/>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">

        {messages.length === 0 && (
          <p className="text-center text-gray-400">
            Start conversation with patient
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.senderType === "doctor"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 ${
                msg.senderType === "doctor"
                  ? "bg-red-500 text-white rounded-br-none"
                  : "bg-green-500 text-white rounded-bl-none"
              }`}
            >
              <p className="break-words">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.senderType === "doctor"
                  ? "text-red-100"
                  : "text-green-100"
              }`}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />

      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:bg-gray-300"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default ChatWindow;