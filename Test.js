require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const http = require('http');
const { Server } = require('socket.io');
require("./config/db");

const PORT = process.env.PORT || process.env.PORT_BACKEND || 3000;

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

  // Join an interest room with basic validation
  socket.on('joinInterest', (interestId) => {
    // Basic validation for interest ID
    if (!interestId || typeof interestId !== 'string') {
      console.log(`Invalid interest ID from ${socket.id}:`, interestId);
      socket.emit('error', 'Invalid interest ID');
      return;
    }
    
    socket.join(interestId);
    console.log(`User ${socket.id} joined interest ${interestId}`);
  });

  // Leave an interest room
  socket.on('leaveInterest', (interestId) => {
    if (!interestId || typeof interestId !== 'string') {
      console.log(`Invalid interest ID from ${socket.id}:`, interestId);
      return;
    }
    
    socket.leave(interestId);
    console.log(`User ${socket.id} left interest ${interestId}`);
  });

  // Handle typing indicators with validation
  socket.on('typing', (data) => {
    if (!data || !data.interestId || !data.userId) {
      console.log(`Invalid typing data from ${socket.id}:`, data);
      return;
    }
    
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
