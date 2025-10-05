const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

const connectMemoryDB = async () => {
  try {
    console.log('🔄 Starting MongoDB Memory Server...');
    
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'helpdesk'
      }
    });
    
    const uri = mongod.getUri();
    console.log('🗄️ Memory DB URI:', uri);
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Memory Server Connected!');
    console.log('📍 Host:', conn.connection.host);
    console.log('🗄️ Database:', conn.connection.name);
    
    return conn;
    
  } catch (error) {
    console.error('❌ Memory DB connection failed:', error.message);
    throw error;
  }
};

const disconnectMemoryDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('🛑 Memory DB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting memory DB:', error.message);
  }
};

module.exports = {
  connectMemoryDB,
  disconnectMemoryDB
};