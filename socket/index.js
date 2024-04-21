const { Server } = require("socket.io");
const user = require("./user");

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    user(socket);
  });

  // Export io as a property of the setupSocket function
  setupSocket.io = io;

  return io;
};

module.exports = setupSocket;
