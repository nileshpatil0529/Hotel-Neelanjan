const { Server } = require('socket.io');

let io; // Store the Socket.IO instance

// Initialize WebSocket
exports.initWebSocket = (server) => {
  io = new Server(server);

  io.on('connection', (socket) => {

    socket.on('disconnect', () => {
    });
  });
};

// Emit events
exports.emitEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
