# 🚀 HelpDesk Vercel Deployment Guide

## Prerequisites
- [ ] Vercel account (free at vercel.com)
- [ ] GitHub repository 
- [ ] MongoDB Atlas account (free)

## Step-by-Step Deployment

### 1. **Prepare MongoDB Atlas**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create account → New Project → Build Database (Free M0)
3. Create database user:
   - Database Access → Add New User
   - Choose Username/Password
   - Set permissions to `readWriteAnyDatabase`
4. Network Access → Add IP Address → `0.0.0.0/0` (Allow from anywhere)
5. Get connection string:
   - Clusters → Connect → Connect Application
   - Copy connection string
   - Replace `<password>` with your user password
   - Replace `myFirstDatabase` with `helpdesk`

### 2. **Push to GitHub**
```bash
# Initialize git (if not already done)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: HelpDesk MERN app"

# Add remote (replace with your GitHub repo)
git remote add origin https://github.com/yourusername/helpdesk.git

# Push
git push -u origin main
```

### 3. **Deploy to Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install`

### 4. **Set Environment Variables**
In Vercel Dashboard → Project → Settings → Environment Variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helpdesk?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRE=7d

# Node Environment
NODE_ENV=production

# Client API URL (will be auto-generated after first deploy)
REACT_APP_API_URL=https://your-project-name.vercel.app/api
```

**Important**: 
- Generate a strong JWT_SECRET (32+ characters)
- Set `REACT_APP_API_URL` to your Vercel app URL + `/api`

### 5. **Redeploy with Environment Variables**
After setting environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Check deployment logs for any errors

### 6. **Verify Deployment**
Test these endpoints:
- `https://your-app.vercel.app` - Frontend should load
- `https://your-app.vercel.app/api/health` - Should return health status
- Login with seeded users (auto-created on first API call)

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas cluster created and configured
- [ ] Environment variables documented
- [ ] GitHub repository created and pushed
- [ ] `.gitignore` excludes sensitive files

### Vercel Setup
- [ ] Project imported from GitHub
- [ ] Build settings configured correctly
- [ ] Environment variables set in Vercel dashboard
- [ ] First deployment successful

### Post-Deployment Testing
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Authentication flow working
- [ ] Ticket creation/management working

## 🔧 Troubleshooting

### Common Issues:

**1. Build Fails**
```
Error: Cannot find module '@vercel/node'
```
**Solution**: Vercel automatically installs this. Check if `vercel.json` is correct.

**2. API Routes Not Working**
```
404 on /api/* routes
```
**Solution**: Verify `vercel.json` routing configuration.

**3. Database Connection Fails**
```
MongoServerError: bad auth
```
**Solution**: 
- Check MongoDB Atlas credentials
- Verify IP whitelist includes `0.0.0.0/0`
- Ensure user has correct permissions

**4. CORS Issues**
```
Access to fetch blocked by CORS policy
```
**Solution**: Verify `REACT_APP_API_URL` points to your Vercel domain.

### Environment Variables Debug:
Add this to verify in Vercel Functions:
```javascript
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
  JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
});
```

## 🔄 Continuous Deployment
Once connected to GitHub:
1. Every push to `main` branch triggers automatic deployment
2. Check deployment status in Vercel dashboard
3. Monitor function logs for any runtime errors

## 🔒 Production Security
- Use strong JWT secrets (32+ characters)
- Enable MongoDB authentication
- Regularly rotate secrets
- Monitor Vercel function logs
- Set up proper CORS origins

## 📊 Monitoring
- Vercel Analytics for performance
- MongoDB Atlas monitoring for database
- Set up error tracking (optional: Sentry)

Your HelpDesk app will be live at: `https://your-project-name.vercel.app`