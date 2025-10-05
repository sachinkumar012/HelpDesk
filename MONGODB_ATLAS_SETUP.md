# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" 
3. Sign up with your email or Google account

## Step 2: Create a Free Cluster
1. Choose "Build a Database"
2. Select "Free" (M0 Sandbox)
3. Choose your preferred cloud provider and region
4. Give your cluster a name (or keep default)
5. Click "Create Cluster"

## Step 3: Create Database User
1. In the "Security" section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Configure Network Access
1. In the "Security" section, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address for better security
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" section
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

## Step 6: Update Your .env File
Replace the MONGODB_URI in your .env file with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/helpdesk?retryWrites=true&w=majority
```

**Important:** Replace:
- `yourusername` with your database username
- `yourpassword` with your database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster address
- `helpdesk` is your database name (you can keep this)

## Step 7: Test Connection
Once updated, restart your server and it should connect to MongoDB Atlas!

## Security Notes
- For production, whitelist only your server's IP address
- Use strong passwords for database users
- Consider using MongoDB Atlas connection string in environment variables