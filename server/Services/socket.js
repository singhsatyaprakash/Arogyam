const { Server } = require("socket.io");
const ChatHistory = require("../Models/chatHistory.model");
const ChatConnection = require("../Models/chatConnection.model");
const { attachVideoSocketHandlers } = require("./videoSocket");

let io;

const initSocket = (server) => {

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://arogyam-swasthya.onrender.com",
    "http://localhost:5173"
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"]
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // join chat room
    socket.on("join_chat", ({ connectionId }) => {
      socket.join(connectionId);
      console.log(`User ${socket.id} joined room ${connectionId}`);
    });

    // send message
    socket.on("send_message", async (data) => {
      const { connectionId, senderId, senderType, text } = data;

      try {

        if (!connectionId || !senderId || !senderType || !text) {
          console.error("Invalid message data:", data);
          return;
        }

        let chatHistory = await ChatHistory.findOne({ connectionId });

        if (!chatHistory) {
          chatHistory = new ChatHistory({
            connectionId,
            messages: []
          });
        }

        const messageObj = {
          senderId,
          senderType,
          text,
          createdAt: new Date()
        };

        chatHistory.messages.push(messageObj);
        await chatHistory.save();

        await ChatConnection.findByIdAndUpdate(
          connectionId,
          {
            $inc: { messageCount: 1 },
            lastActivityAt: new Date()
          },
          { new: true }
        );

        io.to(connectionId).emit("receive_message", messageObj);

        console.log(`Message saved and broadcasted in room ${connectionId}`);

      } catch (err) {
        console.error("Message save error:", err);
        socket.emit("error", { message: "Failed to save message" });
      }
    });

    // leave chat room
    socket.on("leave_chat", ({ connectionId }) => {
      socket.leave(connectionId);
      console.log(`User ${socket.id} left room ${connectionId}`);
    });

    // attach video handlers
    attachVideoSocketHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  });

};

module.exports = { initSocket };