import React, { useEffect, useMemo, useRef, useState } from "react";
import PatientNavbar from '../../patientComponent/PatientNavbar';
import { useSocket } from '../../contexts/SocketContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PROTO_DOCTOR_ID = 'doctor@gmail.com';
const PROTO_PATIENT_ID = 'patient@gmail.com';

export default function PatientChats(){
  const { isConnected, currentUser, joinChatRoom, leaveChatRoom, sendMessage, onReceiveMessage, onTyping, sendTyping } = useSocket();

  const patientId = PROTO_PATIENT_ID;
  const doctorId = PROTO_DOCTOR_ID;
  const roomId = useMemo(() => `chat_${PROTO_DOCTOR_ID}_${PROTO_PATIENT_ID}`, []);

  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [doctorTyping, setDoctorTyping] = useState(false);

  const endRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const toUiMessage = (m) => {
    const ts = m?.createdAt || m?.timestamp || new Date().toISOString();
    const display = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = m?.clientMessageId || m?.id || m?._id || `${ts}-${Math.random()}`;

    const senderIdRaw = m?.senderId ?? m?.from ?? m?.userId ?? m?.sender?.id ?? m?.sender;
    const senderIdStr = senderIdRaw != null ? String(senderIdRaw) : '';

    const senderType =
      senderIdStr && String(patientId) === senderIdStr ? 'patient' :
      senderIdStr && String(PROTO_PATIENT_ID) === senderIdStr ? 'patient' :
      senderIdStr && String(doctorId) === senderIdStr ? 'doctor' :
      senderIdStr && String(PROTO_DOCTOR_ID) === senderIdStr ? 'doctor' :
      (m?.senderType === 'patient' || m?.senderType === 'doctor') ? m.senderType :
      (m?.sender === 'patient' || m?.sender === 'doctor') ? m.sender :
      'doctor';

    return { id, text: m?.text || '', sender: senderType, timestamp: display, timestampISO: ts, senderId: senderIdStr };
  };

  useEffect(() => {
    if (!isConnected) return;

    (async () => {
      await fetch(`${API_URL}/api/chat/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, patientId })
      }).catch(() => {});

      const history = await fetch(`${API_URL}/api/chat/${encodeURIComponent(roomId)}/messages?limit=50`)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null);

      if (history?.messages?.length) setMessages(history.messages.map(toUiMessage));

      joinChatRoom(roomId, patientId, 'patient');

      onReceiveMessage((payload) => {
        if (payload?.roomId !== roomId) return;
        const incoming = toUiMessage(payload.message);
        setMessages(prev => (prev.some(x => x.id === incoming.id) ? prev : [...prev, incoming]));
      });

      onTyping(({ roomId: evtRoomId, userId, isTyping }) => {
        if (evtRoomId !== roomId) return;
        if (String(userId) !== String(doctorId)) return;
        setDoctorTyping(!!isTyping);
      });
    })();

    return () => {
      leaveChatRoom(roomId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [API_URL, isConnected, doctorId, patientId, roomId, joinChatRoom, leaveChatRoom, onReceiveMessage, onTyping]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (v) => {
    setDraft(v);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(roomId, patientId, true);
    typingTimeoutRef.current = setTimeout(() => sendTyping(roomId, patientId, false), 900);
  };

  const onSend = (e) => {
    e.preventDefault();
    if (!draft.trim() || !isConnected) return;

    const sent = sendMessage(roomId, draft, patientId, 'patient');
    if (sent) {
      setMessages(prev => [...prev, toUiMessage(sent)]);
      setDraft('');
      sendTyping(roomId, patientId, false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <main className="pt-16 lg:pt-0 lg:pl-64 p-6">
        <h1 className="text-xl font-semibold mb-4">Chats (Prototype)</h1>

        {!isConnected && <div className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded mb-3">Reconnecting…</div>}

        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="font-medium">Doctor: {doctorId} {doctorTyping ? '(typing...)' : ''}</div>
          <div className="text-sm text-gray-500">Room: {roomId}</div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="h-80 overflow-y-auto space-y-3">
            {messages.map(m => {
              const isMe = m.sender === 'patient';
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[70%] ${
                      isMe
                        ? 'bg-green-500 text-white rounded-br-none'
                        : 'bg-red-500 text-white rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm">{m.text}</div>
                    <div className={`text-xs mt-1 ${isMe ? 'text-green-100' : 'text-red-100'}`}>{m.timestamp}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSend} className="mt-3 flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              value={draft}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message…"
              disabled={!isConnected}
            />
            <button className="bg-blue-600 text-white px-4 rounded" disabled={!isConnected || !draft.trim()}>
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
