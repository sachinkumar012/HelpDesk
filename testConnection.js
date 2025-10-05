require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    const mongoURI = process.env.MONGODB_URI || 
      'mongodb+srv://sachinyadav887780_db_user:Yadav909707@cluster0.h9iiqsp.mongodb.net/helpdesk?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📍 Host:', conn.connection.host);
    console.log('🗄️ Database:', conn.connection.name);
    console.log('🔌 Connection State:', conn.connection.readyState);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('🎉 Connection test passed!');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in the connection string');
    }
    if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('💡 Check your internet connection and MongoDB Atlas network settings');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your MongoDB Atlas cluster URL');
    }
    
    console.log('🔧 Connection string format should be:');
    console.log('mongodb+srv://username:password@cluster.mongodb.net/database');
    
    process.exit(1);
  }
};

testConnection();