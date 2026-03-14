import { useSocket } from "../contexts/SocketContext";
import { useContext, useEffect, useState, useRef } from "react";
import { PatientContext } from "../contexts/PatientContext";
import { IoMdClose } from "react-icons/io";
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
      <div className="flex-1 flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-600">No Conversation Selected</p>
          <p className="text-gray-400 mt-2">Select a doctor to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-green-50 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={selectedDoctor.doctor?.profileImage || noProfileImage}
            alt={selectedDoctor.doctor?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
            onError={(e) => (e.target.src = noProfileImage)}
          />
          <div>
            <h2 className="font-semibold text-gray-800">
              {selectedDoctor.doctor?.name || "Doctor"}
            </h2>
            <p className="text-xs text-gray-500">Consultation Fee: ₹{selectedDoctor.fee}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-full transition"
          >
            <IoMdClose className="text-2xl text-gray-600" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {error && (
          <div className="flex justify-center p-3 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Start your conversation with {selectedDoctor.doctor?.name || "the doctor"}</p>
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
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.senderType === "patient"
                    ? "bg-green-500 text-white rounded-br-none"
                    : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderType === "patient"
                    ? "text-green-100"
                    : "text-gray-600"
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
      <div className="p-4 border-t bg-white flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
export default PatientChatWindow;