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
