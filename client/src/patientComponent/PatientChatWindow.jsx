import { useSocket } from "../contexts/SocketContext";
import { useContext, useEffect, useState, useRef } from "react";
import { PatientContext } from "../contexts/PatientContext";
import { IoMdClose } from "react-icons/io";
import { FaComments, FaPaperPlane, FaCircle } from "react-icons/fa";
import noProfileImage from "../assets/noProfile.webp";
import axios from "axios";

const PatientChatWindow = ({ selectedDoctor, onClose }) => {

  const socket = useSocket();
  const { patient } = useContext(PatientContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Load chat history when doctor is selected
  useEffect(() => {
    if (!selectedDoctor) return;

    const loadChatHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/chats/history/${selectedDoctor._id}`
        );
        if (response.data?.data?.messages) {
          setMessages(response.data.data.messages);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [selectedDoctor]);

  useEffect(() => {
    if (!selectedDoctor || !socket) return;

    const connectionId = selectedDoctor._id;
    socket.emit("join_chat", { connectionId });

    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedDoctor, socket]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = () => {
    if (!message.trim() || !socket) return;

    setSending(true);
    const msgData = {
      connectionId: selectedDoctor._id,
      senderId: patient.patient._id,
      senderType: "patient",
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedDoctor) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-emerald-50/60">
        <div className="text-center px-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">
            <FaComments />
          </div>
          <p className="text-2xl font-semibold text-gray-700">No Conversation Selected</p>
          <p className="text-gray-500 mt-2">Choose a doctor from the left to start your chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/90 to-cyan-50/90 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={selectedDoctor.doctor?.profileImage || noProfileImage}
            alt={selectedDoctor.doctor?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
            onError={(e) => (e.target.src = noProfileImage)}
          />
          <div>
            <h2 className="font-semibold text-gray-800 tracking-tight text-base sm:text-lg">
              {selectedDoctor.doctor?.name || "Doctor"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <FaCircle className="text-[8px]" /> Online
              </span>
              <p className="text-xs text-gray-500">Fee: ₹{selectedDoctor.fee}</p>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-100 rounded-xl transition"
          >
            <IoMdClose className="text-2xl text-gray-600" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-gray-50 to-emerald-50/30"
        style={{ backgroundImage: "radial-gradient(rgba(16,185,129,0.07) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      >
        {error && (
          <div className="flex justify-center p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="bg-white/90 border border-emerald-100 rounded-full px-4 py-2 shadow-sm text-sm sm:text-base">
              Start your conversation with {selectedDoctor.doctor?.name || "the doctor"}
            </p>
          </div>
        ) : (

          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.senderType === "patient" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[86%] sm:max-w-[74%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  msg.senderType === "patient"
                    ? "bg-emerald-500 text-white rounded-br-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                }`}
              >
                <p className="break-words leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderType === "patient"
                    ? "text-emerald-100"
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

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-sm">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 bg-transparent px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-100 text-sm sm:text-base"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? "..." : "Send"}
            {!sending && <FaPaperPlane className="text-xs" />}
          </button>
        </div>
      </div>
    </div>
  );
}
export default PatientChatWindow;