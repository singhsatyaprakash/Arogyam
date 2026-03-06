# Chat System - Quick Reference Guide

## 🚀 Quick Start

### 1. Initialize Chat Connection
```javascript
// Create chat between patient and doctor
POST /chats/new-connection
{
  "doctorId": "60d5ec49f1b2c72b8c8e4a1a",
  "patientId": "60d5ec49f1b2c72b8c8e4a1b", 
  "fee": 500
}

// Response
{
  "success": true,
  "data": {
    "connection": { 
      "_id": "connection_id",
      "patient": {...},
      "doctor": {...},
      "fee": 500,
      "status": "active"
    },
    "chatHistoryId": "history_id"
  }
}
```

### 2. Patient Joins Chat
```javascript
// Frontend (PatientChatWindow.jsx)
import { useSocket } from "../contexts/SocketContext";

const socket = useSocket();
socket.emit("join_chat", { connectionId: selectedDoctor._id });
```

### 3. Send Message
```javascript
socket.emit("send_message", {
  connectionId: selectedDoctor._id,
  senderId: patient.patient._id,
  senderType: "patient",
  text: "Hello doctor!"
});
```

### 4. Receive Message
```javascript
socket.on("receive_message", (message) => {
  setMessages(prev => [...prev, message]);
  // Auto-scroll to new message
});
```

---

## 📁 Modified Files

### Frontend Changes
```
frontend/src/
├── patientComponent/
│   └── PatientChatWindow.jsx      [MODIFIED] ✅
├── doctorComponent/
│   └── ChatWindow.jsx             [MODIFIED] ✅
└── pages/
    └── Patient/
        └── ChatWithDoctor.jsx      [MODIFIED] ✅
```

### Backend Changes
```
backend/
├── Services/
│   └── socket.js                  [MODIFIED] ✅
├── Routes/
│   └── chatRoutes.js              [MODIFIED] ✅
└── Controllers/
    └── chatControllers.js         [MODIFIED] ✅
```

---

## 🎨 UI Features

### Message Styling
```
Patient Message:
┌─────────────────┐
│  Hello doctor!  │   ← Green, right-aligned
└─────────────────┘     12:30 PM

Doctor Response:
┌─────────────────┐
│  Hi! How can    │   ← Red, left-aligned
│  I help?        │
└─────────────────┘     12:31 PM
```

### Header Displays
- Profile image with border
- Doctor/Patient name
- For patients: consultation fee
- Close button (×)

### Interactions
- Type message
- Press **Enter** to send
- **Shift+Enter** for new line
- Auto-scroll to latest message
- Loading spinner during history fetch

---

## 🔌 Socket Events

### Send (Client → Server)
```javascript
socket.emit("join_chat", { connectionId })
socket.emit("send_message", { connectionId, senderId, senderType, text })
socket.emit("leave_chat", { connectionId })
```

### Receive (Server → Client)
```javascript
socket.on("receive_message", (message) => {...})
socket.on("error", (error) => {...})
```

---

## 🗄️ API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/chats/new-connection` | Create chat connection |
| GET | `/chats/history/:connectionId` | Load message history |
| GET | `/chats/patient/:patientId` | Get patient's chats |
| GET | `/chats/doctor/:doctorId` | Get doctor's chats |
| PUT | `/chats/close/:connectionId` | Close chat |

---

## 💾 Database Queries

### Get Chat History
```javascript
db.chathistories.findOne({ connectionId: ObjectId("...") })
```

### Get Chat Connection
```javascript
db.chatconnections.findById(ObjectId("..."))
```

### Find Active Chats
```javascript
db.chatconnections.find({ 
  doctor: ObjectId("..."), 
  status: "active"
})
```

---

## 🧪 Testing Checklist

```
□ Create chat connection
□ Load chat history
□ Send message as patient
□ Receive message as doctor in real-time
□ Send message as doctor
□ Receive message as patient in real-time
□ Verify message timestamps
□ Test Enter key to send
□ Test Shift+Enter for new line
□ Verify auto-scroll works
□ Check profile images load
□ Test close button
□ Verify loading spinner
□ Test error handling
```

---

## ⚙️ Configuration

### Environment Variables
```env
# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Backend (.env)
FRONTEND_URL=http://localhost:5173
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doctorconnect
```

### Socket CORS
```javascript
// backend/Services/socket.js
cors: {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}
```

---

## 🐛 Debugging Tips

### Check Socket Connection
```javascript
// Browser console
console.log(socket.connected);      // true/false
console.log(socket.id);              // socket ID
console.log(socket.rooms);            // connected rooms
```

### View Messages State
```javascript
// In component
console.log('Messages:', messages);
console.log('Connection:', selectedDoctor);
```

### Server Logs
```
Socket connected: aBcDeFgH
User join room connection_id
Message saved and broadcasted in room connection_id
```

---

## 📊 Message Object Structure

```javascript
{
  senderId: "60d5ec49f1b2c72b8c8e4a1a",           // User ID
  senderType: "patient",                          // "patient" or "doctor"
  text: "Hello doctor!",                          // Message content
  createdAt: "2026-03-06T12:30:00.000Z",         // Timestamp
  meta: { isSystemMessage: false }                // Optional metadata
}
```

---

## 🎯 Key Functions

### Load Chat History
```javascript
useEffect(() => {
  if (!selectedDoctor) return;
  
  const loadChatHistory = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/chats/history/${selectedDoctor._id}`
    );
    if (response.data?.data?.messages) {
      setMessages(response.data.data.messages);
    }
  };
  
  loadChatHistory();
}, [selectedDoctor]);
```

### Send Message
```javascript
const handleSend = () => {
  if (!message.trim() || !socket) return;
  
  socket.emit("send_message", {
    connectionId: selectedDoctor._id,
    senderId: patient.patient._id,
    senderType: "patient",
    text: message
  });
  
  setMessage("");
};
```

### Format Time
```javascript
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
};
```

---

## 🎓 Common Patterns

### Connect to Socket Room
```javascript
socket.emit("join_chat", { connectionId });
```

### Listen for Messages
```javascript
socket.on("receive_message", (msg) => {
  setMessages(prev => [...prev, msg]);
});
```

### Cleanup on Unmount
```javascript
return () => {
  socket.off("receive_message");
};
```

---

## ⚡ Performance Tips

1. **Message Pagination** - Load messages in chunks
2. **Virtual Scrolling** - Render only visible messages
3. **Debounce Updates** - Batch multiple updates
4. **Optimized Re-renders** - Use memo/useMemo
5. **Index Messages** - Use MongoDB indexes on connectionId

---

## 📚 Related Documentation

- [Full Implementation Guide](./CHAT_IMPLEMENTATION_GUIDE.md)
- [Changes Summary](./CHAT_SYSTEM_CHANGES.md)
- Socket.io Docs: https://socket.io/docs/
- MongoDB Docs: https://docs.mongodb.com/

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Messages not saving | Check MongoDB connection, verify ChatHistory model |
| Not receiving messages | Ensure `join_chat` called before `send_message` |
| Socket not connecting | Check CORS config, verify URL in env |
| History not loading | Verify API endpoint, check network tab |
| Timestamps wrong | Ensure timezone settings, use UTC in DB |

---

## Version Info
- **Created**: March 6, 2026
- **Status**: ✅ Production Ready
- **Last Updated**: March 6, 2026

