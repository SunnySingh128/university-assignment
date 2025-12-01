const { Server } = require("socket.io");

let io = null;

function initSocket(server) {
  console.log("Initializing Socket.IO...");

  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("registerAdmin", () => {
      console.log("Admin connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

function notifyAdmins(eventName, data) {
  console.log("notifyAdmins CALLED");

  if (!io) {
    console.log("❌ ERROR: Socket.io not initialized!");
    return;
  }

  console.log(`Emitting event → ${eventName}`, data);

  io.emit(eventName, data);
}

module.exports = { initSocket, notifyAdmins };
