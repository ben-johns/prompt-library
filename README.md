# 🚀 Prompt Library

A modern, full-stack web application for organizing and sharing AI prompts within teams. Built with Next.js, NextAuth, and SQLite.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-Database-green?logo=sqlite)
![NextAuth](https://img.shields.io/badge/NextAuth-OAuth-orange)

## ✨ Features

### 🔐 **Authentication & Security**
- **Google OAuth integration** with NextAuth.js
- **Domain-restricted access** (configurable for your organization)
- **Session management** with secure user identification

### 📚 **Prompt Management**
- **Browse prompts** by department and category
- **Submit new prompts** with approval workflow
- **Save favorite prompts** to personal collection
- **Real-time filtering** by department and category
- **Copy to clipboard** functionality
- **Direct integration** with Google Gemini

### 🏢 **Department Organization**
- Project Management
- Marketing
- Sales
- Engineering
- Human Resources
- Finance
- Design
- Customer Support
- Executive
- Operations

### 🎯 **Category Filtering**
- Email templates
- Documentation
- Planning
- Analysis
- Communication
- Reporting
- Team Management

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with pg driver
- **API**: Next.js App Router API routes
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Google OAuth credentials (see setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ben-johns/prompt-library.git
   cd prompt-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Seed the database** (development only)
   ```bash
   npm run dev
   # In another terminal:
   curl -X POST http://localhost:3000/api/seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

See `GOOGLE_AUTH_SETUP.md` for detailed instructions.

## 📊 Database Schema

The application uses PostgreSQL with three main tables:

- **`users`** - User authentication and profile data
- **`prompts`** - All submitted prompts with metadata
- **`saved_prompts`** - Many-to-many relationship for user favorites

## 🔄 API Endpoints

### Public Routes
- `GET /api/prompts` - Get approved prompts (with filtering)
- `GET /api/departments` - Get department statistics

### Authenticated Routes
- `POST /api/prompts` - Submit new prompt
- `GET /api/prompts/my` - Get user's submissions
- `GET /api/prompts/saved` - Get user's saved prompts
- `POST /api/prompts/[id]/save` - Save/unsave prompt
- `PUT /api/prompts/[id]` - Update owned prompt
- `DELETE /api/prompts/[id]` - Delete owned prompt

## 🎨 UI Components

Built with **shadcn/ui** components including:
- Cards, Dialogs, Forms
- Select dropdowns, Input fields
- Toast notifications
- Loading states
- Responsive design

## 📱 Responsive Design

- **Mobile-first** approach
- **Desktop-optimized** layouts
- **Tablet-friendly** interfaces
- **Accessible** components

## 🔒 Security Features

- **Domain-restricted OAuth** (configurable)
- **Server-side session validation**
- **Database input sanitization**
- **Rate limiting ready** (can be added)
- **No sensitive data in client**

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ for better prompt management** 