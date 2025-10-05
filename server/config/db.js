const mongoose = require('mongoose');
const { connectMemoryDB } = require('./memoryDB');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    
    // Get connection string
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk';
    
    console.log('🔗 Attempting local MongoDB connection');
    
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout for local
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
    };

    try {
      const conn = await mongoose.connect(mongoURI, options);
      console.log('✅ MongoDB Connected Successfully!');
      console.log('📍 Host:', conn.connection.host);
      console.log('🗄️ Database:', conn.connection.name);
      console.log('🔌 Connection State:', conn.connection.readyState);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected');
      });
      
      return conn;
    } catch (localError) {
      console.log('⚠️ Local MongoDB not available, using Memory Server...');
      return await connectMemoryDB();
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // More helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Check if MongoDB is running locally or use MongoDB Atlas');
    }
    if (error.message.includes('authentication failed')) {
      console.error('💡 Tip: Check your MongoDB username and password');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Tip: Check your MongoDB Atlas connection string');
    }
    
    console.error('🔧 Full error details:', error);
    process.exit(1);
  }
};

module.exports = connectDB;