require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 Connection URI:', process.env.MONGODB_URI ? 'Set in .env' : 'Using default localhost');
    
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      }
    );

    console.log('✅ MongoDB Connected Successfully!');
    console.log('🏠 Host:', conn.connection.host);
    console.log('📄 Database:', conn.connection.name);
    console.log('🎯 Ready State:', conn.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    await mongoose.disconnect();
    console.log('🔌 Connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('📝 Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solutions:');
      console.log('   1. Start local MongoDB: mongod');
      console.log('   2. Or use MongoDB Atlas (cloud database)');
      console.log('   3. Update MONGODB_URI in .env file');
    }
    
    process.exit(1);
  }
};

testConnection();