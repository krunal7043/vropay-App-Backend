require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const http = require('http');
const { Server } = require('socket.io');
require("./config/db");

const PORT = process.env.PORT_BACKEND || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Configure this based on your frontend URL
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join an interest room
  socket.on('joinInterest', (interestId) => {
    socket.join(interestId);
    console.log(`User ${socket.id} joined interest ${interestId}`);
  });

  // Leave an interest room
  socket.on('leaveInterest', (interestId) => {
    socket.leave(interestId);
    console.log(`User ${socket.id} left interest ${interestId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.interestId).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.IO server is running on http://localhost:${PORT}`);
});

connectDB();
