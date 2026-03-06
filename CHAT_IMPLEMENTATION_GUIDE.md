# Chat System Implementation Guide

## Overview
This guide documents the complete chat system implementation for DoctorConnect, including real-time messaging, chat history persistence, and improved UI/UX.

---

## Architecture

### Components

#### Frontend
1. **SocketContext.jsx** - Socket.io connection provider
2. **PatientChatWindow.jsx** - Patient chat UI with history loading
3. **PatientChatList.jsx** - List of doctors patient can chat with
4. **ChatWindow.jsx** - Doctor chat UI with history loading
5. **DoctorChatList.jsx** - List of patients doctor can chat with
6. **ChatWithDoctor.jsx** - Patient chat page layout
7. **ChatWithPatient.jsx** - Doctor chat page layout

#### Backend
1. **socket.js** - Socket.io event handlers
2. **chatControllers.js** - Chat API controllers
3. **chatRoutes.js** - Chat API routes
4. **chatConnection.model.js** - Chat connection schema
5. **chatHistory.model.js** - Chat history schema

---

## Features Implemented

### 1. Real-Time Messaging
- **Socket Events**:
  - `join_chat` - User joins a chat room
  - `send_message` - User sends a message
  - `receive_message` - Message broadcast to room
  - `leave_chat` - User leaves chat room

### 2. Message Persistence
- All messages saved to MongoDB
- Message structure:
  ```javascript
  {
    senderId: ObjectId,
    senderType: "doctor" | "patient",
    text: String,
    createdAt: Date,
    meta: Object (optional)
  }
  ```

### 3. Chat History Loading
- Messages loaded when opening a chat connection
- Automatic scroll to latest message
- Loading indicator during fetch

### 4. Connection Management
- Track message count
- Track last activity timestamp
- Update connection timestamps on each message

### 5. Enhanced UI
- Message timestamps with 12-hour format
- Styled message bubbles with colors (doctor: red, patient: green)
- Rounded corners matching sender
- Profile images in headers
- Consultation fee display
- Close button to exit chat
- Enter key to send (Shift+Enter for new line)
- Loading spinner feedback
- Error messages display

---

## API Routes

### Chat Endpoints

#### Create Chat Connection
```
POST /chats/new-connection
Body: { doctorId, patientId, fee, note }
Response: { connection, chatHistoryId }
```

#### Get Chat History
```
GET /chats/history/:connectionId
Response: {
  connection: ChatConnection,
  messages: Array<Message>
}
```

#### Get Patient's Chats
```
GET /chats/patient/:patientId
Response: Array<ChatConnection>
```

#### Get Doctor's Chats
```
GET /chats/doctor/:doctorId
Response: Array<ChatConnection>
```

#### Close Chat Connection
```
PUT /chats/close/:connectionId
Body: { reason }
Response: { connection }
```

---

## Socket.io Events

### Server Events

#### join_chat
```javascript
socket.on("join_chat", ({ connectionId }) => {
  // User joins the chat room
  // Listen for incoming messages in this room
})
```

#### send_message
```javascript
socket.on("send_message", {
  connectionId: String,
  senderId: String,
  senderType: "doctor" | "patient",
  text: String
})
```

#### leave_chat
```javascript
socket.on("leave_chat", ({ connectionId }) => {
  // User leaves the chat room
})
```

### Client Events

#### receive_message
```javascript
socket.on("receive_message", (message) => {
  // Add message to state
  setMessages(prev => [...prev, message])
})
```

#### error
```javascript
socket.on("error", { message: String })
```

---

## Database Schema

### ChatConnection
```javascript
{
  patient: ObjectId (Patient),
  doctor: ObjectId (Doctor),
  fee: Number,
  status: "active" | "closed" | "expired",
  paymentStatus: "pending" | "paid" | "refunded",
  startedAt: Date,
  expiresAt: Date (10 days from start),
  messageCount: Number,
  lastActivityAt: Date,
  closeReason: String,
  closedAt: Date
}
```

### ChatHistory
```javascript
{
  connectionId: ObjectId (ChatConnection),
  messages: [
    {
      senderId: ObjectId,
      senderType: "doctor" | "patient" | "admin",
      text: String,
      meta: Object,
      createdAt: Date
    }
  ],
  timestamps: true
}
```

---

## Frontend Implementation Details

### PatientChatWindow
**Key Features**:
- Chat history auto-loads when doctor selected
- Real-time message updates via Socket.io
- Auto-scroll to latest message
- Enter key to send (Shift+Enter for new line)
- Loading spinner during history fetch
- Error display if fetch fails
- Message timestamps
- Doctor info in header (name, fee)

**Props**:
- `selectedDoctor` - Chat connection object with doctor details
- `onClose` - Callback to close chat

**State**:
- `message` - Current input
- `messages` - All messages in conversation
- `loading` - Loading history
- `sending` - Sending message
- `error` - Error message

### ChatWindow (Doctor)
**Similar features to PatientChatWindow but**:
- Shows patient info
- Color scheme uses red for doctor messages
- Green for patient messages

---

## Styling Guide

### Message Bubbles
```css
/* Patient/Doctor message */
.message {
  max-width: 25rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  word-break: break-words;
}

/* Patient message */
.patient {
  background: #22c55e (green-500);
  color: white;
  border-bottom-right-radius: 0;
}

/* Doctor message */
.doctor {
  background: #ef4444 (red-500);
  color: white;
  border-bottom-left-radius: 0;
}

/* Timestamp */
.timestamp {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Backend (.env)
```
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_uri
PORT=3000
```

---

## Common Issues & Solutions

### Issue 1: Messages not saving to database
**Solution**: Ensure ChatHistory model exists. Check if `findOne` returns null, create new history.

### Issue 2: Chat history not loading
**Solution**: 
- Verify API endpoint is correct: `/chats/history/:connectionId`
- Check if connection exists in MongoDB
- Ensure proper error handling in try-catch

### Issue 3: Socket messages not updating in real-time
**Solution**:
- Check Socket.io CORS configuration in server.js
- Verify socket emission syntax: `socket.emit()` vs `io.to().emit()`
- Ensure `join_chat` is called before `send_message`

### Issue 4: Messages appearing null/undefined
**Solution**:
- Validate message object has required fields: `text`, `senderId`, `senderType`
- Check timestamp formatting in UI

---

## Testing Checklist

- [ ] Create chat connection between patient and doctor
- [ ] Load chat history when opening conversation
- [ ] Send message as patient
- [ ] Receive message as doctor in real-time
- [ ] Send message as doctor
- [ ] Receive message as patient in real-time
- [ ] Verify message timestamps
- [ ] Test message count increment
- [ ] Verify lastActivityAt updates
- [ ] Test auto-scroll to latest message
- [ ] Test Enter key to send
- [ ] Test Shift+Enter for new line
- [ ] Test close button functionality
- [ ] Verify UI responsiveness
- [ ] Test error handling (network disconnect)

---

## Performance Optimizations

1. **Message Pagination** (Future)
   - Load messages in chunks instead of all at once
   - Implement "load more" button for older messages

2. **Message Virtualization** (Future)
   - For large conversations, only render visible messages

3. **Message Compression** (Future)
   - Compress message objects before sending

4. **Database Indexes**
   - Indexed on `connectionId` for fast history queries
   - Indexed on `patient` and `doctor` for list queries
   - Indexed on `expiresAt` for cleanup jobs

---

## Future Enhancements

1. **Typing Indicators**
   - Show when other user is typing
   - Real-time typing status

2. **Message Reactions**
   - Add emoji reactions to messages
   - Track reaction counts

3. **File Sharing**
   - Upload and share documents
   - Image sharing in chat

4. **Read Receipts**
   - Show message read status
   - Track when messages were seen

5. **Message Search**
   - Search chat history
   - Filter by date or sender

6. **Chat Notifications**
   - Browser notifications for new messages
   - Sound alerts

7. **Message Encryption**
   - End-to-end encryption for sensitive chats
   - Security improvements

---

## Troubleshooting Commands

### Check Socket Connection
```javascript
// Browser console
socket.connected // true/false
socket.id // socket ID
socket.rooms // connected rooms
```

### View Chat History
```javascript
// Browser console
// In PatientChatWindow/ChatWindow
console.log('Messages:', messages);
console.log('Connection:', selectedDoctor);
```

### Database Query
```javascript
// MongoDB
db.chathistories.find({ connectionId: ObjectId("...") })
db.chatconnections.find({ _id: ObjectId("...") })
```

---

## Support & Contact

For issues or questions about the chat implementation, please refer to the code comments or check the MongoDB/Socket.io documentation.

## Last Updated
March 6, 2026

