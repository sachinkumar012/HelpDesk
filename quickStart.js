const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Quick Start - HelpDesk Application');
console.log('=====================================');

const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    console.log(`▶️ Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      shell: true,
      stdio: 'inherit',
      ...options
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${command} completed successfully`);
        resolve();
      } else {
        console.log(`⚠️ ${command} finished with code ${code}`);
        resolve(); // Don't reject, just continue
      }
    });
    
    process.on('error', (error) => {
      console.error(`❌ Error running ${command}:`, error.message);
      reject(error);
    });
  });
};

const quickStart = async () => {
  try {
    console.log('\\n🧹 Step 1: Clearing ports...');
    await runCommand('npx', ['kill-port', '5000']).catch(() => {});
    await runCommand('npx', ['kill-port', '3000']).catch(() => {});
    
    console.log('\\n🔄 Step 2: Testing database connection...');
    await runCommand('node', ['testConnection.js']);
    
    console.log('\\n🌱 Step 3: Seeding database...');
    await runCommand('node', ['seedDB.js']);
    
    console.log('\\n🚀 Step 4: Starting development servers...');
    console.log('🌐 Frontend will be available at: http://localhost:3000');
    console.log('📡 Backend will be available at: http://localhost:5000');
    console.log('\\n⏳ Starting servers (this may take a moment)...');
    
    // Start development servers
    const dev = spawn('npm', ['run', 'dev'], {
      shell: true,
      stdio: 'inherit'
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down servers...');
      dev.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Quick start failed:', error.message);
    console.log('\\n🔧 Try running commands manually:');
    console.log('1. node testConnection.js');
    console.log('2. node seedDB.js');
    console.log('3. npm run dev');
    process.exit(1);
  }
};

quickStart();