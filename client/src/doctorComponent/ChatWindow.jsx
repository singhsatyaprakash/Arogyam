import React, { useState, useEffect, useRef, useContext } from "react";
import { IoMdClose } from "react-icons/io";
import { FaComments, FaPaperPlane } from "react-icons/fa";
import { useSocket } from "../contexts/SocketContext";
import { DoctorContext } from "../contexts/DoctorContext";
import noProfileImage from "../assets/noProfile.webp";
import axios from "axios";

const ChatWindow = ({ selectedPatient, onClose }) => {

  const socket = useSocket();
  const { doctor } = useContext(DoctorContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Load chat history when patient is selected
  useEffect(() => {
    if (!selectedPatient) {
      setMessages([]);
      return;
    }

    const loadChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/chats/history/${selectedPatient._id}`
        );

        if (response.data?.data?.messages) {
          setMessages(response.data.data.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        setMessages([]);
        setError("Unable to load conversation. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [selectedPatient]);

  useEffect(() => {
    if (!selectedPatient || !socket) return;

    const connectionId = selectedPatient._id;
    socket.emit("join_chat", { connectionId });

    const handleReceiveMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [selectedPatient, socket]);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedPatient) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-rose-50/50">
        <div className="text-center px-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-4">
            <FaComments />
          </div>
          <p className="text-2xl font-semibold text-gray-700">
            No Conversation Selected
          </p>
          <p className="text-gray-500 mt-2">
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

    setSending(true);

    const msgData = {
      connectionId: selectedPatient._id,
      senderId: doctor.doctor._id,
      senderType: "doctor",
      text: message
    };

    socket.emit("send_message", msgData);
    setMessage("");
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div className="px-3.5 py-3 border-b border-red-100 flex items-center justify-between bg-gradient-to-r from-rose-50/90 to-red-50/90 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={selectedPatient.patient?.profileImage || noProfileImage}
            alt="patient"
            className="w-12 h-12 rounded-full object-cover border-2 border-red-200"
            onError={(e) => (e.target.src = noProfileImage)}
          />

          <div>
            <h2 className="font-semibold text-gray-800 tracking-tight text-base sm:text-lg">
              {selectedPatient.patient?.name || "Patient"}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedPatient.patient?.email || ""}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-xl transition"
          >
            <IoMdClose className="text-2xl text-gray-600" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-gray-50 to-rose-50/30"
        style={{ backgroundImage: "radial-gradient(rgba(244,63,94,0.06) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      >

        {error && (
          <div className="flex justify-center p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="bg-white/90 border border-rose-100 rounded-full px-4 py-2 shadow-sm text-sm sm:text-base">
              Start your conversation with {selectedPatient.patient?.name || "the patient"}
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.senderType === "doctor"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[86%] sm:max-w-[74%] rounded-2xl px-3.5 py-2 shadow-sm ${
                  msg.senderType === "doctor"
                    ? "bg-red-500 text-white rounded-br-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                }`}
              >
                <p className="break-words leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderType === "doctor"
                    ? "text-red-100"
                    : "text-gray-500"
                }`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* Input */}
      <div className="px-3 py-2.5 sm:px-3.5 sm:py-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 shadow-sm">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 bg-transparent px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-red-200 disabled:bg-gray-100 text-sm sm:text-base"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 sm:px-5 py-2 rounded-xl font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? "..." : "Send"}
            {!sending && <FaPaperPlane className="text-xs" />}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatWindow;