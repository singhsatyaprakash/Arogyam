# Component Integration Guide 🔌

## ChatWithDoctor.jsx

### Purpose
Main container component that manages chat state and layout.

### Props
None - This is the root component for the chat page.

### State
```javascript
const [selectedDoctor, setSelectedDoctor] = useState(null);
const [isMobileOpen, setIsMobileOpen] = useState(false);
```

### Key Functions
```javascript
// Called when user selects a doctor from the list
handleSelectDoctor(doctor) {
  setSelectedDoctor(doctor);
  setIsMobileOpen(false);
}

// Close mobile menu when navigating
handleCloseMobile() {
  setIsMobileOpen(false);
}
```

### Layout
- Fixed sidebar on desktop (relative positioning)
- Full-width mobile with overlay
- FAB (Floating Action Button) on mobile
- Responsive design with Tailwind breakpoints

---

## PatientChatList.jsx

### Purpose
Displays list of doctors the patient has connected with.

### Props
```typescript
interface Props {
  onSelectDoctor: (doctor: DoctorConnection) => void;
}
```

### State
```javascript
const [connectionList, setConnectionList] = useState([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedId, setSelectedId] = useState(null);
```

### API Integration Points

#### Fetch Connections
```javascript
// Triggered on mount and when patient changes
useEffect(() => {
  const fetchConnections = async () => {
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/patients/getConnectionsList`,
        { patientId: patient._id }
      );
      
      if (result.data.success) {
        setConnectionList(result.data.connections || []);
      }
    } catch (err) {
      setError("Failed to load chats");
    }
  };
  
  fetchConnections();
}, [patient]);
```

### Expected Data Structure
```typescript
interface Connection {
  _id: string;
  doctor: {
    _id: string;
    name: string;
    profileImage?: string;
    specialization?: string;
  };
  lastMessage: string;
  lastActivityAt: string;
  unreadCount: number;
}

interface ApiResponse {
  success: boolean;
  connections: Connection[];
}
```

### Features
- ✅ Real-time search filtering
- ✅ Loading spinner
- ✅ Error handling with retry
- ✅ Empty state messaging
- ✅ Selection highlighting
- ✅ Unread badge display
- ✅ Online status indicator

### Styling Classes Used
- `w-80` - Standard sidebar width (320px)
- `h-screen` - Full viewport height
- `shadow-lg` - Card elevation
- `bg-gradient-to-r` - Header gradient

---

## PatientChatWindow.jsx

### Purpose
Displays chat messages and message input interface.

### Props
```typescript
interface Props {
  selectedDoctor: {
    _id: string;
    doctor: {
      _id: string;
      name: string;
      profileImage?: string;
    };
  } | null;
}
```

### State
```javascript
const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);
const [isTyping, setIsTyping] = useState(false);
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const messagesEndRef = useRef(null);
```

### Message Structure
```typescript
interface Message {
  id: number;
  text: string;
  sender: "patient" | "doctor";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}
```

### Key Functions

#### Send Message
```javascript
const handleSend = () => {
  if (!message.trim()) return;

  const newMessage = {
    id: Date.now(),
    text: message,
    sender: "patient",
    timestamp: new Date(),
    status: "sent",
  };

  // TODO: Send to backend
  // await axios.post(`${API_URL}/chat/send`, {
  //   chatId: selectedDoctor._id,
  //   message: message,
  //   senderId: patient._id
  // });

  setMessages([...messages, newMessage]);
  setMessage("");
};
```

#### Add Emoji
```javascript
const addEmoji = (emoji) => {
  setMessage(message + emoji);
};
```

#### Auto Scroll
```javascript
useEffect(() => {
  scrollToBottom();
}, [messages]);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};
```

### Backend Integration TODO

1. **Load Chat History**
```javascript
// On selectedDoctor change, load chat history
useEffect(() => {
  if (!selectedDoctor) return;

  const loadChatHistory = async () => {
    const response = await axios.get(
      `${API_URL}/chat/${selectedDoctor._id}/messages`
    );
    setMessages(response.data.messages);
  };

  loadChatHistory();
}, [selectedDoctor]);
```

2. **Send Message**
```javascript
const handleSend = async () => {
  if (!message.trim()) return;

  const newMessage = {
    id: Date.now(),
    text: message,
    sender: "patient",
    timestamp: new Date(),
    status: "sent",
  };

  try {
    await axios.post(`${API_URL}/chat/send`, {
      connectionId: selectedDoctor._id,
      message: message,
    });
    
    setMessages([...messages, newMessage]);
    setMessage("");
  } catch (err) {
    console.error("Failed to send message", err);
  }
};
```

3. **Socket.io Integration**
```javascript
// Listen for incoming messages
useEffect(() => {
  if (!socket) return;

  socket.on("receiveMessage", (message) => {
    setMessages(prev => [...prev, message]);
  });

  socket.on("userTyping", (data) => {
    if (data.userId === selectedDoctor.doctor._id) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  });

  return () => {
    socket.off("receiveMessage");
    socket.off("userTyping");
  };
}, [socket, selectedDoctor]);
```

### Empty State
Shows when `selectedDoctor` is null with:
- Gradient background
- Message icon
- Friendly text
- Call-to-action

### Message Rendering
- Patient messages: Right-aligned, green background (#22c55e)
- Doctor messages: Left-aligned, gray background
- Messages include timestamp and delivery status
- Profile image for doctor messages

### Input Features
- File attachment button (UI ready)
- Emoji picker (8 preset emojis)
- Multi-line support (Shift+Enter)
- Send on Enter
- Dynamic send button (disabled when empty)

---

## Socket.io Events Expected

### Listen (Receive)
```javascript
socket.on("receiveMessage", (data) => {
  // {
  //   id: string,
  //   sender: string,
  //   text: string,
  //   timestamp: Date
  // }
});

socket.on("userTyping", (data) => {
  // { userId: string, isTyping: boolean }
});

socket.on("messageDelivered", (messageId) => {
  // Update message status to 'delivered'
});

socket.on("messageRead", (messageId) => {
  // Update message status to 'read'
});

socket.on("userOnlineStatus", (data) => {
  // { userId: string, isOnline: boolean }
});
```

### Emit (Send)
```javascript
socket.emit("sendMessage", {
  connectionId: string,
  text: string,
  timestamp: Date
});

socket.emit("userTyping", {
  connectionId: string,
  isTyping: boolean
});

socket.emit("markAsRead", {
  connectionId: string
});
```

---

## Utility Functions

### Format Time
```javascript
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }
};
```

---

## CSS Classes Reference

### Tailwind Classes Used

#### Colors
- `bg-green-500` - Primary button/active state
- `text-green-600` - Secondary text/status
- `bg-gray-50` - Light backgrounds
- `border-gray-200` - Subtle borders

#### Sizing
- `w-80` - Sidebar width (320px)
- `h-screen` - Full viewport height
- `h-full` - Full parent height
- `w-full` - Full width

#### Spacing
- `px-4` - Horizontal padding
- `py-3` - Vertical padding
- `gap-3` - Space between flex items

#### Effects
- `shadow-sm` - Light shadow
- `shadow-lg` - Heavy shadow
- `rounded-lg` - Medium border radius
- `rounded-full` - Fully rounded

#### States
- `hover:` - Hover state
- `focus:` - Focus state
- `disabled:` - Disabled state
- `group-hover:` - Parent hover effect

---

## Performance Considerations

1. **Message Virtualization**: Consider implementing for large message lists
2. **Debounce Search**: Debounce search input to reduce re-renders
3. **Lazy Loading**: Load message history in chunks
4. **Image Optimization**: Use Next.js Image component for optimization
5. **Memoization**: Memoize component props if needed

---

## Accessibility Features

✅ Semantic HTML  
✅ ARIA labels on buttons  
✅ Keyboard navigation support  
✅ Focus indicators  
✅ Color contrast compliance  
✅ Screen reader support  

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

**Last Updated**: March 3, 2026  
**Version**: 1.0  
**Status**: Ready for Backend Integration
