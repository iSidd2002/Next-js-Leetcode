# Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- MongoDB Atlas account (for production database)
- Deployment platform account (Vercel, Netlify, Railway, etc.)

### Environment Variables Setup

#### Required Environment Variables:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority"
JWT_SECRET="your-super-secure-32-character-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"
NEXTAUTH_SECRET="your-secure-nextauth-secret-for-production"
NEXTAUTH_URL="https://your-domain.com"
```

#### Optional Environment Variables:
```env
LEETCODE_API_URL="https://leetcode.com/graphql"
CODEFORCES_API_URL="https://codeforces.com/api"
```

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new account or sign in

2. **Create a Cluster**
   - Create a new cluster (free tier available)
   - Choose your preferred region

3. **Setup Database Access**
   - Go to Database Access
   - Create a database user with read/write permissions
   - Note down the username and password

4. **Setup Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allow from anywhere) for production
   - Or add your deployment platform's IP ranges

5. **Get Connection String**
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set environment variables in Netlify dashboard

#### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Security Checklist

- ✅ Use strong, unique JWT_SECRET (32+ characters)
- ✅ Use secure NEXTAUTH_SECRET
- ✅ Set correct NEXTAUTH_URL for your domain
- ✅ Use MongoDB Atlas with proper authentication
- ✅ Restrict MongoDB network access if possible
- ✅ Enable HTTPS on your domain

### Post-Deployment

1. **Test Authentication**
   - Register a new account
   - Login/logout functionality

2. **Test Todo Feature**
   - Create, edit, delete todos
   - Verify data persistence

3. **Test Problem Tracking**
   - Add problems
   - Update problem status
   - Verify analytics

### Troubleshooting

#### Common Issues:

1. **MongoDB Connection Error**
   - Check DATABASE_URL format
   - Verify network access settings
   - Ensure database user has correct permissions

2. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure NEXTAUTH_SECRET is set

3. **Build Errors**
   - Check all environment variables are set
   - Verify no TypeScript errors
   - Check Next.js configuration

### Monitoring

- Monitor application logs for errors
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor database performance in MongoDB Atlas
- Set up uptime monitoring

## 🔧 Development Setup

For local development:
1. Copy `.env.example` to `.env.local`
2. Update with your local MongoDB connection
3. Run `npm run dev`

## 📝 Notes

- NODE_ENV is automatically set by deployment platforms
- The duplicate index warning has been fixed
- All todo features are production-ready
- Database schema includes proper indexes for performance
