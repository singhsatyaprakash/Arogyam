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


  socket.on("disconnect", () => {
    const sessionId = socketIdToSessionIdMap.get(socket.id);
    if (sessionId) sessionIdToSocketIdMap.delete(sessionId);
    socketIdToSessionIdMap.delete(socket.id);
  });
};

module.exports = { attachVideoSocketHandlers };


// const activeVideoRooms = new Map();

// const toPublicParticipant = (participant) => ({
//   sessionId: participant.sessionId,
//   appointmentId: participant.appointmentId,
//   participantId: participant.participantId,
//   participantType: participant.participantType,
//   joinedAt: participant.joinedAt,
// });

// const getRoomParticipants = (roomId) => {
//   const room = activeVideoRooms.get(roomId);
//   if (!room) return [];
//   return Array.from(room.values()).map(toPublicParticipant);
// };

// const removeParticipantFromRoom = (socket, roomId) => {
//   const room = activeVideoRooms.get(roomId);
//   if (!room) return;

//   const participant = room.get(socket.id);
//   if (!participant) return;

//   room.delete(socket.id);
//   socket.leave(roomId);
//   socket.to(roomId).emit("video_participant_left", {
//     roomId,
//     participant: toPublicParticipant(participant),
//   });

//   if (room.size === 0) {
//     activeVideoRooms.delete(roomId);
//   }
// };
// /**********************************************/
// const attachVideoSocketHandlers = (io, socket) => {
//   // Video call signaling section
//   socket.on("join_video_room", (payload = {}) => {
//     const { roomId, sessionId, appointmentId, participantId, participantType } = payload;

//     if (!roomId || !participantId || !participantType) {
//       socket.emit("video_call_error", { message: "Invalid room join payload" });
//       return;
//     }
    
//     if (!activeVideoRooms.has(roomId)) {
//       activeVideoRooms.set(roomId, new Map());
//     }

//     const room = activeVideoRooms.get(roomId);
//     const participant = {
//       sessionId,
//       appointmentId,
//       participantId,
//       participantType,
//       joinedAt: new Date().toISOString(),
//     };

//     room.set(socket.id, participant);
//     socket.join(roomId);

//     socket.emit("video_room_state", {
//       roomId,
//       participants: getRoomParticipants(roomId),
//     });

//     socket.to(roomId).emit("video_participant_joined", {
//       roomId,
//       participant: toPublicParticipant(participant),
//     });
//   });

//   socket.on("video_offer", ({ roomId, offer, sessionId } = {}) => {
//     if (!roomId || !offer) return;
//     socket.to(roomId).emit("video_offer", { roomId, offer, sessionId });
//   });

//   socket.on("video_answer", ({ roomId, answer, sessionId } = {}) => {
//     if (!roomId || !answer) return;
//     socket.to(roomId).emit("video_answer", { roomId, answer, sessionId });
//   });

//   socket.on("video_ice_candidate", ({ roomId, candidate, sessionId } = {}) => {
//     if (!roomId || !candidate) return;
//     socket.to(roomId).emit("video_ice_candidate", { roomId, candidate, sessionId });
//   });

//   socket.on("leave_video_room", ({ roomId } = {}) => {
//     if (!roomId) return;
//     removeParticipantFromRoom(socket, roomId);
//   });

//   socket.on("disconnect", () => {
//     for (const roomId of activeVideoRooms.keys()) {
//       removeParticipantFromRoom(socket, roomId);
//     }
//   });
// };

// module.exports = { attachVideoSocketHandlers };