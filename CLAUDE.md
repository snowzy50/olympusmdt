# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OlympusMDT is a premium MDT (Mobile Data Terminal) SaaS platform for FiveM Law Enforcement and emergency services roleplay. The system supports multiple agencies (SASP, SAMC, SAFD, Dynasty8, DOJ) with role-based access control via Discord OAuth2.

**Created by:** Snowzy

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Note:** Tests are located in `.claude/TestUnitaire/` directory (configured in jest.config.js).

### Database (Supabase)
```bash
supabase db push     # Apply local migrations to remote
supabase db pull     # Pull schema from remote
supabase link        # Link to Supabase project
```

## Architecture

### Multi-Agency System

The application is built around a **multi-agency architecture** where users can access different agency dashboards based on their Discord roles:

- **Agency Configuration:** Centralized in `config/agencies.ts`
- **Discord Role Mapping:** Each agency has a Discord role ID that grants access
- **Admin Override:** Admin users have access to all agencies
- **Agency Selection:** After login, users select their agency at `/agency-selection`
- **Agency Dashboards:** Each agency has dedicated routes at `/dashboard/{agencyId}`

**Supported Agencies:**
- `sasp` - Police d'État (SASP)
- `samc` - Services Médicaux (SAMC)
- `safd` - Pompiers (SAFD)
- `dynasty8` - Immobilier (Dynasty 8)
- `doj` - Justice (DOJ)

### Authentication Flow

1. **Discord OAuth2** (`/login`) - Primary authentication method
2. **Admin Bypass** (`/admin`) - Credentials login for admin (Admin/Admin123)
3. **Token Generation** (`lib/auth/config.ts`) - JWT with Discord roles and agencies
4. **Middleware Protection** (`middleware.ts`) - Route protection and agency access control
5. **Session Provider** (`components/providers/SessionProvider.tsx`) - NextAuth session management

**Key Files:**
- `lib/auth/config.ts` - NextAuth configuration
- `lib/auth/discord-role-service.ts` - Discord role fetching
- `config/agencies.ts` - Agency/role mapping
- `middleware.ts` - Route protection logic

### Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS with custom design system
- **Database:** Supabase (PostgreSQL) with Realtime
- **Authentication:** NextAuth.js with Discord OAuth2
- **State Management:** React hooks with custom hooks in `hooks/`
- **UI Components:** Custom component library in `components/ui/`
- **Icons:** Lucide React

### Project Structure

```
app/
├── page.tsx                    # Root redirect to /login
├── layout.tsx                  # Root layout with SessionProvider
├── globals.css                 # Tailwind CSS and custom styles
├── login/                      # Login page
├── admin/                      # Admin login page
├── agency-selection/           # Agency selection after auth
├── dashboard/
│   ├── page.tsx               # General dashboard
│   └── [agencyId]/            # Agency-specific dashboards
│       ├── agents/            # Agent management
│       ├── citizens/          # Citizen database
│       ├── dispatch/          # Dispatch system
│       ├── events/            # Event management
│       ├── organizations/     # Gang/Mafia management
│       └── ...                # Other modules
└── api/
    └── auth/                  # NextAuth API routes

components/
├── layout/                    # Layout components (MainLayout, Sidebar, Header)
├── ui/                        # Reusable UI components (Button, Card, Badge, etc.)
├── dashboard/                 # Dashboard-specific components
├── organizations/             # Organization management components
└── providers/                 # React context providers

lib/
├── auth/                      # Authentication utilities
├── supabase/                  # Supabase client and types
└── dateUtils.ts              # Date formatting utilities

config/
└── agencies.ts               # Agency configuration and role mapping

types/
├── agent.ts                  # Agent type definitions
├── organizations.ts          # Organization/gang/territory types
└── next-auth.d.ts           # NextAuth type extensions

hooks/
├── useSupabaseAgents.ts     # Agent data management
├── useRealtimeSync.ts       # Supabase realtime subscriptions
├── useEvents.ts             # Event management
├── useOrganizations.ts      # Organization CRUD operations
└── useDispatchCalls.ts      # Dispatch call management
```

### Database Schema

**Key Tables (Supabase):**
- `agents` - Agent/officer records with agency association
- `agent_history` - Audit trail for agent changes
- `organizations` - Gang/Mafia/MC organizations
- `organization_members` - Organization membership
- `territories` - Territory polygons on map
- `territory_pois` - Points of interest
- `events` - Event tracking system

**Database Types:** Defined in `lib/supabase/client.ts`

### Design System

**Colors:**
- Primary: Blue palette (`primary-{50-900}`)
- Dark theme: `dark-{100,200,300}`
- Semantic: `success`, `warning`, `error`, `info` (full palettes)
- Agency-specific: `agencies.{sasp|samc|safd|dynasty8|doj}`

**Custom Classes:**
- `glass-strong` - Strong glass morphism effect
- `hover-card` - Card with hover animation
- Status indicators, badges, and buttons use agency colors

**Animations:** fade-in, slide-up, slide-down, scale-in, float, glow (see tailwind.config.ts)

## Development Guidelines

### Environment Variables

Required variables (see `.env.example`):
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID` - Discord OAuth2
- `DISCORD_BOT_TOKEN` - Discord bot for role fetching
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - NextAuth configuration
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` - Supabase connection

### Path Aliases

Use `@/` for imports (maps to root directory):
```typescript
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
```

### Component Development

1. **UI Components** (`components/ui/`) are reusable across all agencies
2. **Agency Components** should support theming via agency color props
3. **Layout Components** (`components/layout/`) handle navigation and structure
4. **Use custom hooks** from `hooks/` for data fetching and state management

### Adding New Agencies

1. Add agency config to `config/agencies.ts` with Discord role ID
2. Create dashboard folder: `app/dashboard/{agencyId}/`
3. Add agency color to `tailwind.config.ts` under `agencies`
4. Update `middleware.ts` if special permissions needed

### Database Queries

Use the Supabase client from `lib/supabase/client.ts`:
```typescript
import { supabase } from '@/lib/supabase/client';

// Always filter by agency_id
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('agency_id', agencyId);
```

### Realtime Subscriptions

Use `useRealtimeSync` hook for live data updates:
```typescript
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

const { data, isConnected } = useRealtimeSync(
  'agents',
  `agency_id=eq.${agencyId}`
);
```

## Important Notes

- **Never include "Claude" or "Generated by Claude" in code** - Always use "Créé par Snowzy"
- **Documentation creation is manual** - Don't auto-generate documentation
- **Strict TypeScript** is enabled - Handle all type errors
- **Build errors temporarily ignored** (see next.config.js) - Fix when possible
- **ReactStrictMode disabled** temporarily for Realtime debugging
- **Tests run from** `.claude/TestUnitaire/` directory
- **Agency access** is controlled via Discord roles and middleware

## Common Patterns

### Creating Agency-Protected Pages

```typescript
// app/dashboard/{agencyId}/example/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { getAgencyById } from '@/config/agencies';

export default function ExamplePage({ params }: { params: { agencyId: string } }) {
  const { data: session } = useSession();
  const agency = getAgencyById(params.agencyId);

  // Agency-specific logic here
}
```

### Using Agency Colors

```typescript
const agency = getAgencyById(agencyId);
const colorClass = `text-${agency.color}-500`;
const bgClass = `bg-${agency.color}-500/10`;
```

### Error Handling with Supabase

```typescript
const { data, error } = await supabase.from('table').select('*');

if (error) {
  console.error('Error:', error);
  // Handle error appropriately
  return;
}

// Process data
```

## Documentation

Extensive documentation exists in `.claude/Documentation/`:
- Architecture guides
- Authentication implementation
- Module-specific docs (Dashboard, Events, Agents)
- User guides
- UX/UI reviews

**Access via:** `.claude/Documentation/README.md`
