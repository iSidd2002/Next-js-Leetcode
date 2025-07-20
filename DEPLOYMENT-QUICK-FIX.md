# 🚨 Quick Deployment Fix

## MongoDB Connection Error Solution

### Problem
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

### Solution: Set Production Environment Variables

#### 1. Vercel Dashboard Setup
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-32-character-jwt-secret-key-here
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your-secure-nextauth-secret-for-production
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### 2. MongoDB Atlas Quick Setup
1. **Create Account**: [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Create Cluster**: Choose free tier
3. **Database Access**: Create user with read/write permissions
4. **Network Access**: Add IP `0.0.0.0/0` (allow all)
5. **Connect**: Get connection string, replace `<password>` and `<dbname>`

#### 3. Generate Secure Secrets
```bash
# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

#### 4. Redeploy
After setting environment variables in Vercel:
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or push a new commit to trigger deployment

### Environment Variable Template
```env
# Production MongoDB Atlas
DATABASE_URL="mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/leetcode-tracker?retryWrites=true&w=majority"

# Secure JWT (generate with: openssl rand -base64 32)
JWT_SECRET="your-generated-32-character-secret-here"
JWT_EXPIRES_IN="7d"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-nextauth-secret-here"
NEXTAUTH_URL="https://your-app-name.vercel.app"

# Optional APIs
LEETCODE_API_URL="https://leetcode.com/graphql"
CODEFORCES_API_URL="https://codeforces.com/api"
```

### Troubleshooting
- **Still getting localhost error?** → Check environment variables are set in Vercel
- **MongoDB connection timeout?** → Check network access whitelist in Atlas
- **Authentication error?** → Verify database user credentials
- **Build still failing?** → Check all required environment variables are set

### Quick Test
After deployment, test these endpoints:
- `https://your-app.vercel.app/api/health` - Should return 200
- `https://your-app.vercel.app/api/auth/profile` - Should return 401 (expected)

This will confirm the database connection is working.
