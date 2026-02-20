// OnePatientChat.jsx (Updated with better socket handling)
import React, { useState, useRef, useEffect, useMemo } from 'react';
import DoctorNavbar from '../../doctorComponent/DoctorNavbar';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaPaperPlane, 
  FaVideo, 
  FaPhone, 
  FaPaperclip, 
  FaUserCircle,
  FaClock,
  FaArrowLeft,
  FaCheckDouble
} from 'react-icons/fa';
import { useSocket } from '../../contexts/SocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PROTO_DOCTOR_ID = 'doctor@gmail.com';
const PROTO_PATIENT_ID = 'patient@gmail.com';

const OnePatientChat = () => {
  const nav = useNavigate();
  const { patientId } = useParams();
  const {
    isConnected,
    currentUser,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    onReceiveMessage,
    onTyping,
    sendTyping,
    scheduleCall,
    joinVideoRoom,
    startCall
  } = useSocket();

  const doctorId = currentUser?.id || PROTO_DOCTOR_ID;
  // enforce prototype pair
  const fixedPatientId = PROTO_PATIENT_ID;
  const roomId = useMemo(() => `chat_${PROTO_DOCTOR_ID}_${PROTO_PATIENT_ID}`, []);
  const callRoomId = useMemo(() => `call_${PROTO_DOCTOR_ID}_${PROTO_PATIENT_ID}`, []);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // now loaded from API + realtime

  const [patient, setPatient] = useState({
    name: String(patientId || 'Patient'),
    lastSeen: '—',
    online: true,
    isTyping: false
  });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const toUiMessage = (m) => {
    const ts = m?.createdAt || m?.timestamp || new Date().toISOString();
    const display = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = m?.clientMessageId || m?.id || m?._id || `${ts}-${Math.random()}`;

    const senderIdRaw = m?.senderId ?? m?.from ?? m?.userId ?? m?.sender?.id ?? m?.sender;
    const senderIdStr = senderIdRaw != null ? String(senderIdRaw) : '';

    // Prefer senderId matching; fall back to explicit role fields.
    let senderType =
      senderIdStr && String(doctorId) === senderIdStr ? 'doctor' :
      senderIdStr && String(PROTO_DOCTOR_ID) === senderIdStr ? 'doctor' :
      senderIdStr && String(fixedPatientId) === senderIdStr ? 'patient' :
      senderIdStr && String(patientId) === senderIdStr ? 'patient' :
      (m?.senderType === 'doctor' || m?.senderType === 'patient') ? m.senderType :
      (m?.sender === 'doctor' || m?.sender === 'patient') ? m.sender :
      'patient';

    return {
      id,
      text: m?.text || '',
      sender: senderType, // 'doctor' | 'patient'
      senderId: senderIdStr,
      timestamp: display,
      timestampISO: ts,
      status: m?.status || (m?.delivered ? 'delivered' : undefined),
    };
  };

  useEffect(() => {
    if (!isConnected || !doctorId || !patientId) return;

    let offReceive = () => {};
    let offTyping = () => {};

    (async () => {
      // ensure room exists (prototype)
      await fetch(`${API_URL}/api/chat/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, patientId })
      }).catch(() => {});

      // load history
      const history = await fetch(`${API_URL}/api/chat/${encodeURIComponent(roomId)}/messages?limit=50`)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null);

      if (history?.messages?.length) setMessages(history.messages.map(toUiMessage));

      // join + realtime
      joinChatRoom(roomId, doctorId, 'doctor');

      const handleIncoming = (payload) => {
        if (payload?.roomId !== roomId) return;
        const incoming = toUiMessage(payload.message);
        setMessages((prev) => (prev.some(x => x.id === incoming.id) ? prev : [...prev, incoming]));
      };

      const handleTypingEvt = ({ roomId: evtRoomId, userId, isTyping }) => {
        if (evtRoomId !== roomId) return;
        if (String(userId) !== String(patientId)) return;
        setPatient(prev => ({ ...prev, isTyping: !!isTyping }));
      };

      onReceiveMessage(handleIncoming);
      onTyping(handleTypingEvt);

      // best-effort cleanup via socketService helper if available
      offReceive = () => (typeof window !== 'undefined' ? null : null);
      offTyping = () => (typeof window !== 'undefined' ? null : null);
    })();

    return () => {
      leaveChatRoom(roomId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      offReceive();
      offTyping();
    };
  }, [API_URL, isConnected, doctorId, patientId, roomId, joinChatRoom, leaveChatRoom, onReceiveMessage, onTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(roomId, doctorId, true);
    typingTimeoutRef.current = setTimeout(() => sendTyping(roomId, doctorId, false), 900);
  };

  const sendMessageHandler = (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    const sent = sendMessage(roomId, message, doctorId, 'doctor');
    if (sent) {
      setMessages(prev => [...prev, toUiMessage(sent)]);
      setMessage('');
      sendTyping(roomId, doctorId, false);
    }
  };

  const startVideoCallNow = () => {
    if (!isConnected) return;
    const now = new Date().toISOString();

    scheduleCall(callRoomId, PROTO_DOCTOR_ID, PROTO_PATIENT_ID, now);
    joinVideoRoom(callRoomId, PROTO_DOCTOR_ID, 'doctor', currentUser || { id: PROTO_DOCTOR_ID, type: 'doctor' });
    startCall(callRoomId, PROTO_DOCTOR_ID, PROTO_PATIENT_ID);

    nav(`/doctor/video-call/${encodeURIComponent(callRoomId)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      
      <main className="p-4 md:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* Connection Status */}
          {!isConnected && (
            <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>⚠️ Reconnecting to chat service...</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, Dr. Satyal</h1>
              <p className="text-gray-500">Friday, December 19, 2025</p>
            </div>
            <button 
              onClick={() => window.history.back()} 
              className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Patient Info Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-4 h-fit">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUserCircle className="text-red-500 text-4xl" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">{patient.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${patient.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-500">
                    {patient.isTyping 
                      ? 'Typing...' 
                      : patient.online 
                        ? 'Online' 
                        : `Last seen ${patient.lastSeen}`
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={startVideoCallNow}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
                >
                  <FaVideo />
                  Start Video Call
                </button>
                <button className="w-full flex items-center justify-center gap-2 border border-red-500 text-red-500 py-3 rounded-lg hover:bg-red-50 transition">
                  <FaPhone />
                  Audio Call
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-700 mb-3">Patient Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Visit:</span>
                    <span className="font-medium">Dec 18, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">Hypertension</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <FaUserCircle className="text-red-500" />
                    </div>
                    {patient.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                    <p className="text-sm text-gray-500">
                      {patient.isTyping 
                        ? 'Typing...' 
                        : patient.online 
                          ? 'Online' 
                          : `Last seen ${patient.lastSeen}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <FaVideo />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <FaPhone />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isDoctor = msg.sender === 'doctor';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isDoctor
                              ? 'bg-red-500 text-white rounded-br-none'
                              : 'bg-green-500 text-white rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              isDoctor ? 'text-red-100' : 'text-green-100'
                            }`}
                          >
                            <FaClock className="text-xs" />
                            {msg.timestamp}
                            {msg.sender === 'doctor' && msg.status && (
                              <>
                                <span className="mx-1">•</span>
                                {msg.status === 'read' ? (
                                  <FaCheckDouble className="text-blue-400" />
                                ) : msg.status === 'delivered' ? (
                                  <FaCheckDouble />
                                ) : (
                                  <span>Sent</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={sendMessageHandler} className="flex gap-3">
                  <button type="button" className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <FaPaperclip />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your message here..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={!isConnected}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || !isConnected}
                    className={`p-3 rounded-lg transition ${
                      message.trim() && isConnected
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnePatientChat;