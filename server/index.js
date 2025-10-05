require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');

const connectDB = require('./config/db');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Auto-seed database with test users
const autoSeedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('🌱 No users found, seeding database...');
      
      const testUsers = [
        {
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'admin123',
          role: 'admin'
        },
        {
          name: 'Agent User',
          email: 'agent@test.com',
          password: 'agent123',
          role: 'agent'
        },
        {
          name: 'Test User',
          email: 'user@test.com',
          password: 'user123',
          role: 'user'
        }
      ];

      for (const userData of testUsers) {
        await User.create(userData);
        console.log(`✅ Created ${userData.role}: ${userData.email}`);
      }

      console.log('🎉 Database seeded successfully!');
      console.log('');
      console.log('🔑 Test Credentials:');
      console.log('   Admin: admin@test.com / admin123');
      console.log('   Agent: agent@test.com / agent123');
      console.log('   User: user@test.com / user123');
      console.log('');
    } else {
      console.log('✅ Users already exist in database');
    }
  } catch (error) {
    console.error('❌ Auto-seed error:', error.message);
  }
};

console.log('🔄 Starting HelpDesk Server...');
console.log('📝 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 5000); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'HelpDesk API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HelpDesk API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join ticket room for real-time updates
  socket.on('join-ticket', (ticketId) => {
    socket.join(`ticket-${ticketId}`);
    console.log(`User ${socket.id} joined ticket room: ${ticketId}`);
  });

  // Leave ticket room
  socket.on('leave-ticket', (ticketId) => {
    socket.leave(`ticket-${ticketId}`);
    console.log(`User ${socket.id} left ticket room: ${ticketId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// SLA breach check - runs every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running SLA breach check...');
    
    const now = new Date();
    const result = await Ticket.updateMany(
      {
        $and: [
          { status: { $nin: ['resolved', 'closed'] } },
          { slaDeadline: { $lt: now } },
          { breached: false }
        ]
      },
      { breached: true }
    );

    if (result.modifiedCount > 0) {
      console.log(`${result.modifiedCount} tickets marked as breached`);
      
      // Emit real-time update for breached tickets
      io.emit('sla-breach-update', {
        count: result.modifiedCount,
        timestamp: now
      });
    }
  } catch (error) {
    console.error('SLA breach check error:', error);
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT error
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Auto-seed database if no users exist
    await autoSeedDatabase();
    
    server.listen(PORT, () => {
      console.log('🚀 ================================');
      console.log(`🌟 HelpDesk Server is running!`);
      console.log(`📡 Port: ${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📅 Started: ${new Date().toLocaleString()}`);
      console.log('🚀 ================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;