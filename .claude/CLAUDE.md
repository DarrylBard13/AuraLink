# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuraLink is a personal finance management React application that helps users manage bills, subscriptions, and budgets. The app uses Stack Auth for authentication, Neon for PostgreSQL database, and is deployed on Vercel.

## Development Commands

```bash
# Install dependencies (required due to legacy peer deps)
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **Authentication**: Stack Auth (@stackframe/react)
- **Database**: Neon PostgreSQL (@neondatabase/serverless)
- **Deployment**: Vercel
- **Routing**: React Router DOM

### Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Radix UI-based design system components
│   ├── auth/            # Authentication-related components
│   ├── dashboard/       # Dashboard-specific components
│   └── [feature]/       # Feature-specific components
├── pages/               # Route components (bills, dashboard, etc.)
├── lib/                 # Utility libraries and database functions
├── api/                 # API integration functions
├── stack/               # Stack Auth configuration
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
└── utils/               # General utility functions
```

### Key Architectural Patterns

#### Authentication Flow
- App.jsx wraps everything in StackProvider and StackTheme
- Routes are split between `/handler/*`, `/auth/*` (Stack Auth) and `/*` (app pages)
- NeonProtectedRoute component guards protected pages with 5-second timeout fallback
- Stack Auth handles OAuth (Google, etc.) via StackHandler component

#### Routing Strategy
- Main routes handled in App.jsx with React Router
- Page routes centralized in pages/index.jsx with nested Routes
- Protected routes wrapped in NeonProtectedRoute component
- Dynamic page detection based on URL segments

#### Database Integration
- Neon PostgreSQL connection via @neondatabase/serverless
- Database utilities in lib/database.js
- Environment variables: DATABASE_URL, DATABASE_POSTGRES_URL, or DATABASE_DATABASE_URL
- Auto-creates users table on first use

#### Component Architecture
- Design system built on Radix UI primitives in components/ui/
- Feature-specific components organized by domain (bills, dashboard, etc.)
- Layout component handles navigation and page structure
- Mock agentSDK used in assistant and budgetbuilder pages (replace with real implementation)

## Environment Variables

AuraLink requires both client-side and server-side environment variables.  

**Client-side (safe to expose in browser, must start with `VITE_`):**
```bash
VITE_STACK_PROJECT_ID=<stack-auth-project-id>
VITE_STACK_PUBLISHABLE_CLIENT_KEY=<stack-auth-key>
```
- These are public keys used by the frontend for authentication.  
- Accessed in React code with `import.meta.env.VITE_*`.  

**Server-side (private, do not prefix with `VITE_`):**
```bash
DATABASE_URL=<neon-postgres-connection-string>
```
- This is the Neon PostgreSQL connection string.  
- Must only be accessed in backend code (API routes, serverless functions, or `lib/database.ts`).  
- Use `process.env.DATABASE_URL` in Node/server code.  

**Example `.env.local`:**
```bash
# Client-side
VITE_STACK_PROJECT_ID=your-stack-project-id
VITE_STACK_PUBLISHABLE_CLIENT_KEY=your-stack-client-key

# Server-side only
DATABASE_URL=postgres://username:password@host:5432/dbname
```

⚠️ **Security Note:** Do not prefix secrets like `DATABASE_URL` with `VITE_`. Doing so exposes them to the client bundle and browser dev tools.  

👉 **Setup Instructions:**  
Create a `.env.local` file in the root of your project and paste in your real values (replacing the placeholders above). This file should **not** be committed to Git—ensure it is included in `.gitignore`.

## Build Configuration

### Vite Configuration
- Root directory: current directory (.)
- Path alias: @ maps to project root
- Manual chunk splitting for optimal bundle sizes:
  - react-vendor: React core
  - radix-vendor: All Radix UI components
  - stack-vendor: Stack Auth
  - db-vendor: Database clients
  - [category]-vendor: Grouped by functionality

### Vercel Configuration
- Framework: Vite
- Build command: `npm run build`
- Install command: `npm install --legacy-peer-deps`
- Output directory: dist
- SPA routing: All routes redirect to /index.html
- API routes: /api/* routes to serverless functions

## Common Issues & Solutions

### Stack Auth Integration
- Stack Auth client configured in stack/client.ts
- Uses cookie-based token storage
- Auto-detects baseUrl (do not hardcode for OAuth compatibility)
- Fallback values provided for missing environment variables

### Legacy Dependencies
- Uses `npm install --legacy-peer-deps` due to peer dependency conflicts
- Known deprecation warning: @simplewebauthn/types (from Stack Auth dependency)
- This warning is cosmetic and doesn't affect functionality

### Bundle Optimization
- Manual chunk splitting configured to prevent large bundle warnings
- Chunk size limit set to 1000kb
- Dependencies grouped by category for optimal caching

## Page Structure

Main application pages:
- `/dashboard` - Main dashboard with financial overview
- `/bills` - Bill management
- `/subscriptions` - Subscription tracking
- `/income` - Income management
- `/budgets` - Budget overview
- `/budgetbuilder` - AI budget building (uses mock agent)
- `/assistant` - AI financial assistant (uses mock agent)
- `/stickynotes` - Notes/reminders
- `/settings` - Application settings

Authentication pages:
- `/login` - Public login page (redirects from protected routes)
- `/handler/*` - Stack Auth OAuth handling
- `/auth/*` - Stack Auth OAuth callbacks

## Development Notes

### Mock Agent SDK
The assistant and budgetbuilder pages currently use inline mock `agentSDK` objects with basic conversation methods. These should be replaced with actual AI agent implementations when available.

### Database Schema
The app auto-creates a basic users table with fields: id, name, preferred_name, email, password_hash, created_at, updated_at. Additional tables should be added as needed for bills, subscriptions, etc.

### Component Patterns
- Use existing Radix UI components from components/ui/
- Follow established patterns in existing pages for consistency
- Implement loading states and error boundaries for robust UX
- Use Tailwind classes for styling with design system tokens

### Diff vs Full File
When making code changes:
- Prefer showing only the updated lines (diffs) instead of rewriting the entire file, unless I explicitly request a full file rewrite.