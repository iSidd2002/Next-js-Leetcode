# LeetCode CF Tracker - Next.js Edition

A comprehensive problem tracking application built with Next.js, featuring the exact same UI and functionality as the original React/Vite + Express.js version, but with a unified Next.js architecture.

## 🚀 Features

### Frontend Features (Identical to Original)
- **Dashboard**: Overview of your progress with statistics and charts
- **Problem Management**: Add, edit, delete, and track coding problems
- **Spaced Repetition**: Smart review system for better retention
- **Contest Tracking**: Track your performance in coding contests
- **Company Problems**: Filter and organize problems by company
- **Problem of the Day**: Integration with LeetCode's daily challenges
- **Analytics**: Detailed statistics and progress visualization
- **Multi-platform Support**: LeetCode, CodeForces, AtCoder
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on all devices

### Backend Features (Next.js API Routes)
- **RESTful API**: Complete API with authentication
- **Database Integration**: MongoDB with Prisma ORM
- **JWT Authentication**: Secure user authentication
- **Data Validation**: Input validation and error handling
- **External API Integration**: LeetCode GraphQL API
- **CORS Support**: Proper cross-origin resource sharing

## 🛠️ Tech Stack




### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - UI components
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **React Hook Form** - Form handling
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma** - Database ORM
- **MongoDB** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### AI Features
- **AI Review Insights** - Personalized learning strategies and recommendations
- **Similar Problems** - AI-powered problem recommendations with reasoning
- **Smart Analysis** - Pattern recognition and skill assessment
- **Learning Optimization** - Adaptive study plans based on performance

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nextjs-leetcode-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your values:
   ```env
   NEXT_PUBLIC_DATABASE_URL="mongodb://localhost:27017/leetcode-cf-tracker"
   JWT_SECRET="your-super-secret-32-character-jwt-key"
   JWT_EXPIRES_IN="7d"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)


## 🤖 AI/LLM Integration (OpenRouter)

This app uses OpenRouter exclusively for AI features (hints, explanations, bug detection, code review, suggestions).

Setup:
- Get a key: https://openrouter.ai/keys
- Add to your `.env.local`:
  - OPENROUTER_API_KEY="sk-or-v1-..."
  - (Optional) OPENROUTER_MODELS="deepseek/deepseek-chat-v3.1:free,deepseek/deepseek-chat-v3.1,openai/gpt-4o-mini"
  - (Optional) OPENROUTER_SITE_URL, OPENROUTER_SITE_NAME

Health check:
- Start dev: `npm run dev`
- Visit: http://localhost:3000/api/ai/health (should return ok: true and a model sample)

More details and migration guide: docs/OPENROUTER_MIGRATION.md

## 🗄️ Database Schema

The application uses MongoDB with Prisma ORM. The schema includes:

- **Users**: User accounts with settings
- **Problems**: Coding problems with spaced repetition data
- **Contests**: Contest participation records

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Problems
- `GET /api/problems` - Get user problems (with filters)
- `POST /api/problems` - Create new problem
- `PUT /api/problems/[id]` - Update problem
- `DELETE /api/problems/[id]` - Delete problem

### Contests
- `GET /api/contests` - Get user contests
- `POST /api/contests` - Create new contest
- `PUT /api/contests/[id]` - Update contest
- `DELETE /api/contests/[id]` - Delete contest

### External APIs
- `POST /api/potd` - Get LeetCode Problem of the Day

### Health Check
- `GET /api/health` - API health check

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🔄 Migration from Original App

This Next.js version maintains 100% feature parity with the original React/Vite + Express.js version:

### What's the Same:
- ✅ Identical UI and user experience
- ✅ All components and functionality
- ✅ Same data models and API contracts
- ✅ Authentication and authorization
- ✅ Spaced repetition algorithm
- ✅ External API integrations

### What's Different:
- 🔄 Unified Next.js architecture (no separate backend)
- 🔄 Prisma ORM instead of Mongoose
- 🔄 API routes instead of Express controllers
- 🔄 Built-in optimizations and performance improvements

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Add Problems**: Use the "Add Problem" button to track solved problems
3. **Review System**: Problems will appear for review based on spaced repetition
4. **Track Contests**: Record your contest performances
5. **View Analytics**: Monitor your progress with detailed statistics
6. **Company Filter**: Organize problems by target companies
7. **AI Features**: Get personalized insights and problem recommendations

## 📖 Review System Guide

The app features a powerful spaced repetition review system to help you retain what you learn.

### Review Modes

When reviewing a problem, you have two options:

#### 1. Quality Based (Default)
Rate how well you remembered the solution:
- **Again** - Couldn't solve it (review in 1 day)
- **Hard** - Struggled significantly (review in 2 days)
- **Good** - Got it with some effort (review in 3+ days)
- **Easy** - Solved smoothly (review in 7+ days)
- **Perfect** - Mastered completely (review in 14+ days)

The system automatically calculates the optimal next review date based on your rating.

#### 2. Custom Days / Pick a Date
For more control, switch to "Custom Days" tab:

**Option A - Days from now:**
- Enter a specific number of days (1-365)
- Use quick presets: 1, 3, 7, 14, 30, 60, or 90 days
- See the calculated review date instantly

**Option B - Pick a specific date:**
- Toggle to "Pick a date" mode
- Select any future date from the calendar
- Perfect for scheduling reviews around exams, interviews, or specific events

### Additional Review Features

- **Time Tracking**: Optionally log how long the review took
- **Quick Tags**: Add tags like "tricky-edge-case", "need-revisit", "interview-ready"
- **Notes**: Add additional notes that append to existing problem notes
- **Move to Learned**: Mark a problem as fully mastered (removes from review queue)

### Tips for Effective Reviews

1. **Be honest** with your quality ratings - this helps the algorithm work better
2. **Use custom dates** when you have specific deadlines (interviews, contests)
3. **Add notes** about edge cases or insights you want to remember
4. **Mark as Learned** only when you're confident you've truly mastered a problem

## 🚀 Deployment

This application is production-ready and can be deployed on multiple platforms:

### Quick Deploy Options:
- **Vercel** (Recommended): `npm run deploy:vercel`
- **Docker**: `npm run deploy:docker`
- **Traditional VPS**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Environment Setup:
1. Copy `.env.example` to `.env.local`
2. Configure required environment variables:
   - `DATABASE_URL` - MongoDB connection string
   - `JWT_SECRET` - Secure JWT secret key
   - `NEXTAUTH_SECRET` - NextAuth secret key
   - `NEXTAUTH_URL` - Your production domain
   - `GEMINI_API_KEY` - Google Gemini API key for AI features

### Health Check:
- Visit `/api/health` to verify deployment status
- Monitor database connectivity and environment configuration

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Original React/Vite + Express.js implementation
- LeetCode for the Problem of the Day API
- Shadcn/UI for the beautiful components
- Next.js team for the amazing framework
