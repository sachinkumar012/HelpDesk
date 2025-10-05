require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
const connectDB = require('./server/config/db');

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create test users
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
        name: 'Regular User',
        email: 'user@test.com',
        password: 'user123',
        role: 'user'
      }
    ];
    
    // Hash passwords and create users
    for (const userData of testUsers) {
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      const user = new User(userData);
      await user.save();
      console.log(`Created ${userData.role}: ${userData.email}`);
    }
    
    console.log('Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('Agent: agent@test.com / agent123');
    console.log('User: user@test.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();