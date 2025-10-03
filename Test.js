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

// Connection tracking and rate limiting
const connectedUsers = new Map();
const rateLimit = new Map();
const connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  disconnections: 0
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  const now = Date.now();
  
  // Rate limiting: max 5 connections per minute per IP
  if (!rateLimit.has(clientIP)) {
    rateLimit.set(clientIP, []);
  }
  
  const connections = rateLimit.get(clientIP);
  const recentConnections = connections.filter(time => now - time < 60000);
  
  if (recentConnections.length >= 5) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    socket.emit('rateLimitExceeded', 'Too many connections');
    socket.disconnect();
    return;
  }
  
  recentConnections.push(now);
  rateLimit.set(clientIP, recentConnections);
  
  // Update connection stats
  connectionStats.totalConnections++;
  connectionStats.activeConnections++;
  
  console.log(`User connected: ${socket.id} from IP: ${clientIP}`);
  console.log(`Active connections: ${connectionStats.activeConnections}`);

  // Prevent duplicate connections
  socket.on('authenticate', (userId) => {
    if (connectedUsers.has(userId)) {
      console.log(`Duplicate connection detected for user: ${userId}`);
      const oldSocketId = connectedUsers.get(userId);
      io.to(oldSocketId).emit('forceDisconnect', 'New connection established');
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect();
      }
    }
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Join an interest room with validation
  socket.on('joinInterest', async (interestId) => {
    try {
      // Validate interestId format
      if (!interestId || !/^[a-f\d]{24}$/i.test(interestId)) {
        socket.emit('error', 'Invalid interest ID format');
        console.log(`Invalid interest ID from ${socket.id}: ${interestId}`);
        return;
      }
      
      // Check if interest exists
      const Interest = require('./model/Interest');
      const interest = await Interest.findById(interestId);
      if (!interest) {
        socket.emit('error', 'Interest not found');
        console.log(`Interest not found: ${interestId}`);
        return;
      }
      
      socket.join(interestId);
      console.log(`User ${socket.id} successfully joined interest ${interestId}`);
      
      // Notify other users in the room
      socket.to(interestId).emit('userJoined', {
        socketId: socket.id,
        userId: socket.userId || 'unknown'
      });
      
    } catch (error) {
      console.error(`Error joining interest ${interestId}:`, error);
      socket.emit('error', 'Failed to join interest');
    }
  });

  // Leave an interest room
  socket.on('leaveInterest', (interestId) => {
    if (!interestId || !/^[a-f\d]{24}$/i.test(interestId)) {
      socket.emit('error', 'Invalid interest ID format');
      return;
    }
    
    socket.leave(interestId);
    console.log(`User ${socket.id} left interest ${interestId}`);
    
    // Notify other users in the room
    socket.to(interestId).emit('userLeft', {
      socketId: socket.id,
      userId: socket.userId || 'unknown'
    });
  });

  // Handle typing indicators with validation
  socket.on('typing', (data) => {
    if (!data || !data.interestId || !data.userId) {
      socket.emit('error', 'Invalid typing data');
      return;
    }
    
    if (!/^[a-f\d]{24}$/i.test(data.interestId)) {
      socket.emit('error', 'Invalid interest ID');
      return;
    }
    
    socket.to(data.interestId).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping,
      socketId: socket.id
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.id} disconnected. Reason: ${reason}`);
    
    // Update connection stats
    connectionStats.activeConnections--;
    connectionStats.disconnections++;
    
    // Clean up user tracking
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
    
    // Log stats every 10 disconnections
    if (connectionStats.disconnections % 10 === 0) {
      console.log('Connection Stats:', connectionStats);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Socket.IO server is running on http://localhost:${PORT}`);
});

connectDB();
