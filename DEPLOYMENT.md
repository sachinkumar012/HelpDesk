# Environment Variables for Vercel Deployment

## Required Environment Variables

Add these in your Vercel dashboard (Settings > Environment Variables):

### Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helpdesk?retryWrites=true&w=majority

### JWT Configuration  
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d

### Server Configuration
NODE_ENV=production
PORT=5000

### CORS (Optional)
CLIENT_URL=https://your-vercel-app.vercel.app

## How to Set Up MongoDB Atlas (Required for Production)

1. Go to https://cloud.mongodb.com/
2. Create a free account or sign in
3. Create a new cluster (Free tier M0)
4. Create a database user:
   - Database Access > Add New Database User
   - Username/Password authentication
   - Give readWrite permissions
5. Whitelist your IP:
   - Network Access > Add IP Address
   - Add 0.0.0.0/0 (allow from anywhere) for Vercel
6. Get connection string:
   - Clusters > Connect > Connect your application
   - Copy the connection string
   - Replace <password> with your database user password
   - Replace <dbname> with "helpdesk"

Example MongoDB URI:
mongodb+srv://helpdesk-user:yourpassword@cluster0.abcde.mongodb.net/helpdesk?retryWrites=true&w=majority

## Security Notes
- Never commit these values to your repository
- Use strong, unique passwords for JWT_SECRET
- Rotate secrets regularly in production