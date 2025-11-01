# CLAUDE.md

This file provides guidance to Claude Code when working on the Olympus MDT project.

## 🎯 Project Vision

**Olympus MDT** is a modern SaaS Multi-Agency Mobile Data Terminal system for FiveM roleplay servers. Built with a focus on scalability, real-time collaboration, and professional-grade features.

## 🏗️ Architecture Philosophy

### Core Principles
1. **Step-by-Step Development** - Build incrementally, test thoroughly at each step
2. **Modern Stack** - React 18+ with TypeScript, Vite for fast development
3. **Real Database** - Supabase (PostgreSQL) from day 1, no localStorage hacks
4. **Authentication First** - Discord OAuth2 with proper role-based access control
5. **Type Safety** - TypeScript everywhere, proper interfaces and types
6. **Testing** - Playwright E2E tests for critical flows

### Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router v6 (routing)
- React Query / TanStack Query (server state)
- Zustand or Jotai (client state - lightweight)

**Backend/Services:**
- Supabase (PostgreSQL database, Auth, Real-time subscriptions)
- Discord OAuth2 (authentication)
- Vercel or OVH (hosting)

**Development:**
- TypeScript
- ESLint + Prettier
- Playwright (E2E testing)
- Vitest (unit testing)

## 📋 Development Phases

### Phase 1: Foundation (PRIORITY)
✅ **Step 1.1:** Project scaffolding
- Initialize Vite + React + TypeScript
- Configure TailwindCSS
- Set up ESLint, Prettier, Git
- Create folder structure

✅ **Step 1.2:** Supabase Setup
- Create Supabase project
- Design database schema (agencies, users, cases, etc.)
- Set up Row Level Security (RLS) policies
- Configure environment variables

✅ **Step 1.3:** Discord OAuth2 Authentication
- Configure Discord application
- Implement OAuth2 flow
- Store user session in Supabase
- Role mapping (Discord roles → App permissions)

✅ **Step 1.4:** Basic UI Shell
- Login page with Discord button
- Protected route wrapper
- Agency selection page
- Dashboard layout with sidebar

### Phase 2: Core Features
⏳ **Step 2.1:** Agency Management
- List agencies (SASP, SAMC, SAFD, Dynasty8, DOJ)
- Agency access control based on Discord roles
- Agency-specific branding (logos, colors)

⏳ **Step 2.2:** Case Management (MVP)
- Create case (CRUD operations)
- List cases with filters
- Case details view
- Real-time updates via Supabase subscriptions

⏳ **Step 2.3:** Citizen Records
- Citizen profiles (name, DOB, photo, etc.)
- Link citizens to cases
- Search functionality

⏳ **Step 2.4:** Vehicle Records
- Vehicle registration
- Owner information
- Link to citizen profiles
- Search by plate number

### Phase 3: Advanced Features
⏳ **Step 3.1:** Warrants System
- Create arrest warrants
- Active/Executed status
- Link to cases and citizens

⏳ **Step 3.2:** Complaints Management
- Citizen complaints
- Investigation workflow
- Status tracking

⏳ **Step 3.3:** Real-time Collaboration
- Multiple users viewing same case
- Live presence indicators
- Optimistic UI updates

⏳ **Step 3.4:** Notifications
- In-app notifications
- New case assignments
- Status changes

### Phase 4: Polish & Scale
⏳ **Step 4.1:** Performance Optimization
- Code splitting
- Lazy loading
- Caching strategies

⏳ **Step 4.2:** Analytics & Reporting
- Case statistics
- Agency performance metrics
- Export functionality

⏳ **Step 4.3:** Admin Panel
- User management
- Role assignment
- System configuration

⏳ **Step 4.4:** Mobile Responsive
- Mobile-first design
- Touch-friendly UI
- PWA support

## 📁 Folder Structure

```
olympusmdt/
├── api/                    # Serverless functions (optional)
│   └── discord-roles.ts    # Fetch Discord user roles
├── docs/                   # Documentation
│   ├── SETUP.md           # Setup instructions
│   ├── DATABASE.md        # Database schema
│   └── API.md             # API documentation
├── config/                # Configuration files
│   ├── .env.example       # Environment template
│   └── supabase/          # Supabase migrations
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base components (Button, Input, etc.)
│   │   ├── layout/       # Layout components
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Route pages
│   │   ├── Login.tsx
│   │   ├── AgencySelect.tsx
│   │   └── Dashboard.tsx
│   ├── services/         # API clients, utilities
│   │   ├── supabase.ts   # Supabase client
│   │   ├── discord.ts    # Discord auth
│   │   └── api.ts        # API wrapper
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCases.ts
│   │   └── useRealtime.ts
│   ├── store/            # State management
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/            # TypeScript types
│   │   ├── database.ts   # Generated from Supabase
│   │   ├── models.ts     # Business models
│   │   └── api.ts        # API response types
│   ├── utils/            # Utility functions
│   │   ├── roleUtils.ts
│   │   └── formatters.ts
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── routes.tsx        # Route definitions
├── tests/                # Test files
│   ├── e2e/             # Playwright tests
│   └── unit/            # Vitest tests
├── public/              # Static assets
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── CLAUDE.md            # This file
└── README.md
```

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test          # Unit tests
npm run test:e2e      # E2E tests

# Linting
npm run lint
npm run lint:fix

# Database migrations
npm run db:migrate
npm run db:reset
npm run db:seed
```

## 🗄️ Database Schema (Supabase)

### Core Tables

**agencies**
- id (uuid, PK)
- name (text) - SASP, SAMC, SAFD, Dynasty8, DOJ
- display_name (text)
- logo_url (text)
- discord_role_id (text) - Maps to Discord role
- created_at (timestamp)

**users**
- id (uuid, PK) - Supabase Auth user ID
- discord_id (text, unique)
- discord_username (text)
- discord_avatar (text)
- email (text)
- created_at (timestamp)
- updated_at (timestamp)

**user_agencies**
- id (uuid, PK)
- user_id (uuid, FK → users)
- agency_id (uuid, FK → agencies)
- role (text) - 'member', 'supervisor', 'admin'
- created_at (timestamp)

**cases**
- id (uuid, PK)
- agency_id (uuid, FK → agencies)
- case_number (text, unique, generated)
- title (text)
- description (text)
- status (text) - 'open', 'investigating', 'closed'
- priority (text) - 'low', 'medium', 'high', 'critical'
- assigned_to (uuid, FK → users)
- created_by (uuid, FK → users)
- created_at (timestamp)
- updated_at (timestamp)

**citizens**
- id (uuid, PK)
- first_name (text)
- last_name (text)
- date_of_birth (date)
- photo_url (text)
- address (text)
- phone (text)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)

**vehicles**
- id (uuid, PK)
- plate_number (text, unique)
- make (text)
- model (text)
- year (integer)
- color (text)
- owner_id (uuid, FK → citizens)
- status (text) - 'registered', 'stolen', 'impounded'
- created_at (timestamp)
- updated_at (timestamp)

**warrants**
- id (uuid, PK)
- citizen_id (uuid, FK → citizens)
- case_id (uuid, FK → cases)
- warrant_type (text) - 'arrest', 'search'
- reason (text)
- status (text) - 'active', 'executed', 'cancelled'
- issued_by (uuid, FK → users)
- issued_at (timestamp)
- executed_at (timestamp)

**complaints**
- id (uuid, PK)
- agency_id (uuid, FK → agencies)
- complainant_name (text)
- complainant_contact (text)
- subject (text)
- description (text)
- status (text) - 'pending', 'investigating', 'resolved', 'dismissed'
- assigned_to (uuid, FK → users)
- created_at (timestamp)
- resolved_at (timestamp)

### Row Level Security (RLS) Policies

All tables must have RLS enabled:
```sql
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Users can only see cases from agencies they belong to
CREATE POLICY "Users see own agency cases"
ON cases FOR SELECT
USING (
  agency_id IN (
    SELECT agency_id
    FROM user_agencies
    WHERE user_id = auth.uid()
  )
);
```

## 🔐 Authentication Flow

### Discord OAuth2 Setup

1. **Discord Developer Portal**
   - Create application
   - Add redirect URI: `{APP_URL}/auth/callback`
   - Enable OAuth2 scopes: `identify`, `guilds.members.read`
   - Copy Client ID and Client Secret

2. **Discord Bot Setup**
   - Create bot in same application
   - Enable "Server Members Intent"
   - Copy Bot Token
   - Invite bot to server with permission `1024` (View Server Members)

3. **Role Mapping**
   - Get Discord role IDs from server (Developer Mode → Right-click role)
   - Map in `config/discord-roles.json`:
   ```json
   {
     "1411802770092200078": "sasp",
     "1411802995188043908": "safd"
   }
   ```

### Authentication Implementation

1. User clicks "Login with Discord"
2. Redirect to Discord OAuth URL
3. Discord redirects back with `code`
4. Exchange code for access token
5. Fetch user info from Discord API
6. Fetch user's guild member info (roles) via bot
7. Create/update user in Supabase
8. Create user session with Supabase Auth
9. Map Discord roles to agency access
10. Insert/update `user_agencies` records

## 🧪 Testing Strategy

### E2E Tests (Playwright)
- Authentication flow (Discord OAuth)
- Agency selection
- Case CRUD operations
- Search and filters
- Real-time updates

### Unit Tests (Vitest)
- Utility functions
- Custom hooks (with React Testing Library)
- State management
- Type guards

## 🚀 Deployment

### Environment Variables

**Required:**
```bash
# Discord OAuth2
VITE_DISCORD_CLIENT_ID=
VITE_DISCORD_CLIENT_SECRET=
VITE_DISCORD_GUILD_ID=
DISCORD_BOT_TOKEN=  # Server-side only

# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-side only

# Application
VITE_APP_URL=
```

### Deployment Platforms

**Option A: Vercel (Recommended)**
- Automatic deployments from Git
- Serverless functions for Discord role API
- Edge network (fast globally)
- Free tier available

**Option B: OVH**
- Traditional hosting
- PHP support for Discord API
- Manual FTP deployment

## 📝 Code Style & Best Practices

### TypeScript
- Always use explicit types, avoid `any`
- Use interfaces for object shapes
- Use type guards for runtime validation
- Generate types from Supabase schema

### React
- Functional components only
- Custom hooks for reusable logic
- Proper dependency arrays in useEffect
- Memoization for expensive computations

### State Management
- Server state: React Query (fetching, caching, syncing)
- Client state: Zustand (UI state, user preferences)
- Form state: React Hook Form
- Avoid prop drilling, use context sparingly

### API Calls
- Always handle loading states
- Always handle errors
- Show user feedback (toasts, notifications)
- Implement retry logic for transient failures

### Real-time
- Use Supabase subscriptions for live updates
- Clean up subscriptions on unmount
- Handle reconnection gracefully

## 🐛 Debugging

### Development Tools
```javascript
// Supabase client debugging
import { supabase } from './services/supabase';
console.log('Session:', await supabase.auth.getSession());
console.log('User:', await supabase.auth.getUser());

// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// Add to App.tsx
```

### Common Issues

**Issue: "User not authenticated"**
- Check Supabase session is valid
- Verify RLS policies allow access
- Check Discord role mapping

**Issue: "Real-time not working"**
- Verify Supabase Real-time is enabled for table
- Check RLS policies on table
- Ensure subscription cleanup

**Issue: "Discord roles not syncing"**
- Verify bot has "Server Members Intent"
- Check bot is in the Discord server
- Validate Discord role IDs in config

## 🎨 UI/UX Guidelines

### Design System
- Use TailwindCSS utility classes
- Create reusable component library in `components/ui/`
- Follow consistent spacing (4px grid)
- Dark mode support from day 1

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus indicators

### Performance
- Lazy load routes
- Optimize images (WebP, lazy loading)
- Virtualize long lists
- Debounce search inputs

## 🔄 Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/xxx` - New features
- `fix/xxx` - Bug fixes
- `hotfix/xxx` - Urgent production fixes

### Commit Messages
```
type(scope): subject

Examples:
feat(auth): implement Discord OAuth2 flow
fix(cases): resolve duplicate case numbers
docs(readme): add setup instructions
chore(deps): update dependencies
```

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Discord OAuth2 Docs](https://discord.com/developers/docs/topics/oauth2)
- [React Query Docs](https://tanstack.com/query/latest)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Playwright Docs](https://playwright.dev/)

---

**Last Updated:** 2025-01-11
**Current Phase:** Phase 1 - Foundation
**Next Step:** Initialize Vite project with TypeScript
