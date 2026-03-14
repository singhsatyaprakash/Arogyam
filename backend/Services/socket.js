const { Server } = require("socket.io");
const ChatHistory = require("../Models/chatHistory.model");
const ChatConnection = require("../Models/chatConnection.model");
const { attachVideoSocketHandlers } = require("./videoSocket");

let io;

const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true
    }
  });
  //io-->for all sockets...
  // socket--> for each individual socket connection...
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Chat socket section
    // join chat room
    socket.on("join_chat", ({ connectionId }) => {
      socket.join(connectionId);
      console.log(`User ${socket.id} joined room ${connectionId}`);
    });

    // send message
    socket.on("send_message", async (data) => {
      const { connectionId, senderId, senderType, text } = data;

      try {
        // Validate required fields
        if (!connectionId || !senderId || !senderType || !text) {
          console.error("Invalid message data:", data);
          return;
        }

        // Update or create chat history
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

        // Update chat connection - increment message count and update activity
        await ChatConnection.findByIdAndUpdate(
          connectionId,
          {
            $inc: { messageCount: 1 },
            lastActivityAt: new Date()
          },
          { new: true }
        );

        // broadcast message to room
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
    // all video socket handlers
    attachVideoSocketHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });

  });

};

module.exports = { initSocket };