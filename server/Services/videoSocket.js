const sessionIdToSocketIdMap = new Map();
const socketIdToSessionIdMap = new Map();

const attachVideoSocketHandlers = (io, socket) => {

  socket.on("room:join", (data) => {
    const { sessionId, roomId } = data;

    sessionIdToSocketIdMap.set(sessionId, socket.id);
    socketIdToSessionIdMap.set(socket.id, sessionId);

    // Join FIRST, then broadcast
    socket.join(roomId);

    // Notify only OTHER users in the room (not self)
    socket.to(roomId).emit("user:joined", { sessionId, socketId: socket.id });

    // Send the new user a list of who is already in the room
    const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
    const existingUsers = [];

    if (socketsInRoom) {
      for (const sid of socketsInRoom) {
        if (sid !== socket.id) {
          existingUsers.push({
            socketId: sid,
            sessionId: socketIdToSessionIdMap.get(sid),
          });
        }
      }
    }

    io.to(socket.id).emit("room:joined", { data, existingUsers });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:answer", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("peer:ice:candidate", ({ to, candidate }) => {
    if (!to || !candidate) return;
    io.to(to).emit("peer:ice:candidate", { from: socket.id, candidate });
  });

  socket.on("call:end", ({ to }) => {
  if (!to) return;
    io.to(to).emit("call:ended", { from: socket.id });
  });

  socket.on("disconnect", () => {
    const sessionId = socketIdToSessionIdMap.get(socket.id);
    if (sessionId) sessionIdToSocketIdMap.delete(sessionId);
    socketIdToSessionIdMap.delete(socket.id);
  });
};

module.exports = { attachVideoSocketHandlers };


//check this improveed version///
/* 
const sessionIdToSocketIdMap = new Map();
const socketIdToSessionIdMap = new Map();
const socketIdToRoomIdMap = new Map();

const attachVideoSocketHandlers = (io, socket) => {
  socket.on("room:join", (data) => {
    const { sessionId, roomId } = data;

    sessionIdToSocketIdMap.set(sessionId, socket.id);
    socketIdToSessionIdMap.set(socket.id, sessionId);
    socketIdToRoomIdMap.set(socket.id, roomId);

    socket.join(roomId);

    socket.to(roomId).emit("user:joined", { sessionId, socketId: socket.id });

    const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
    const existingUsers = [];

    if (socketsInRoom) {
      for (const sid of socketsInRoom) {
        if (sid !== socket.id) {
          existingUsers.push({
            socketId: sid,
            sessionId: socketIdToSessionIdMap.get(sid),
          });
        }
      }
    }

    io.to(socket.id).emit("room:joined", { data, existingUsers });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:answer", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("peer:ice:candidate", ({ to, candidate }) => {
    if (!to || !candidate) return;
    io.to(to).emit("peer:ice:candidate", { from: socket.id, candidate });
  });

  socket.on("call:end", ({ to }) => {
    if (!to) return;
    io.to(to).emit("call:ended", { from: socket.id });
  });

  socket.on("disconnect", () => {
    const sessionId = socketIdToSessionIdMap.get(socket.id);
    const roomId = socketIdToRoomIdMap.get(socket.id);

    if (roomId) {
      socket.to(roomId).emit("call:ended", { from: socket.id });
    }

    if (sessionId) sessionIdToSocketIdMap.delete(sessionId);
    socketIdToSessionIdMap.delete(socket.id);
    socketIdToRoomIdMap.delete(socket.id);
  });
};

module.exports = { attachVideoSocketHandlers };
*/
