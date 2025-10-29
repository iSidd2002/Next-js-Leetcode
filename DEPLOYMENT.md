# 🚀 Deployment Guide

This guide covers multiple deployment options for the LeetCode CF Tracker application.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup
Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

**Required Variables:**
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - 32+ character secret key
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Your production domain
- `GEMINI_API_KEY` - Google Gemini API key for AI features

### 2. Database Setup
- **Development**: Local MongoDB or MongoDB Atlas
- **Production**: MongoDB Atlas (recommended)

### 3. Build Test
```bash
npm run build
npm run start
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**1. Install Vercel CLI:**
```bash
npm i -g vercel
```

**2. Deploy:**
```bash
vercel --prod
```

**3. Environment Variables:**
Set in Vercel dashboard or via CLI:
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GEMINI_API_KEY
```

**4. Custom Domain (Optional):**
```bash
vercel domains add yourdomain.com
```

### Option 2: Docker Deployment

**1. Build Image:**
```bash
docker build -t leetcode-tracker .
```

**2. Run Container:**
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-mongodb-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NEXTAUTH_SECRET="your-nextauth-secret" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e GEMINI_API_KEY="your-gemini-key" \
  leetcode-tracker
```

**3. Docker Compose (Optional):**
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    env_file:
      - .env.local
```

### Option 3: Traditional VPS/Server

**1. Server Setup:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2
```

**2. Deploy Application:**
```bash
# Clone repository
git clone <your-repo-url>
cd nextjs-leetcode-tracker

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "leetcode-tracker" -- start
pm2 save
pm2 startup
```

**3. Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Production Optimizations

### 1. Environment Variables
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 2. Database Optimization
- Use MongoDB Atlas with appropriate cluster size
- Enable connection pooling
- Set up database indexes for better performance

### 3. Security Headers
Already configured in `next.config.js`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin

### 4. Performance Monitoring
- Enable Vercel Analytics (if using Vercel)
- Set up error tracking (Sentry recommended)
- Monitor API response times

## 🔍 Troubleshooting

### Common Issues:

**1. Build Failures:**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

**2. Database Connection:**
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has proper permissions

**3. Environment Variables:**
- Verify all required variables are set
- Check for typos in variable names
- Ensure secrets are properly generated

**4. AI Features Not Working:**
- Verify Gemini API key is valid
- Check API quota and billing
- Monitor API rate limits

## 📊 Monitoring & Maintenance

### Health Checks:
- `/api/health` - Application health
- `/api/auth/profile` - Authentication status
- `/api/problems` - Database connectivity

### Logs:
```bash
# PM2 logs
pm2 logs leetcode-tracker

# Docker logs
docker logs <container-id>

# Vercel logs
vercel logs
```

### Updates:
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild and restart
npm run build
pm2 restart leetcode-tracker
```

## 🎯 Success Metrics

After deployment, verify:
- ✅ Application loads correctly
- ✅ User authentication works
- ✅ Database operations function
- ✅ AI features respond properly
- ✅ All API endpoints return expected responses
- ✅ Mobile responsiveness maintained
- ✅ Performance meets expectations

## 🆘 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Test locally with production build

Your LeetCode CF Tracker is now ready for production! 🎉
