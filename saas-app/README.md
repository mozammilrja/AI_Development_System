# SaaS Application

A modern SaaS application built as a demonstration workspace for the **multi-agent AI development system**. This application showcases a full-stack TypeScript implementation with authentication, team management, subscriptions, and billing.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React 18 • TypeScript • Vite • TailwindCSS • React Query   │
├─────────────────────────────────────────────────────────────┤
│                         Backend                              │
│   Express • TypeScript • MongoDB • JWT • Zod Validation     │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Authentication
- User registration and login
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Session management

### Team Management
- Create and manage teams
- Invite team members via email
- Member roles: Owner, Admin, Member
- Accept/decline invitations

### Subscription & Billing
- Multiple plan tiers: Free, Starter, Pro, Enterprise
- Monthly and yearly billing cycles
- Upgrade/downgrade plans
- Cancel/resume subscriptions
- Billing history

### User Settings
- Profile management
- Password change
- Notification preferences
- Session management

## Project Structure

```
saas-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── layout/       # Layout components
│   │   │   └── features/     # Feature-specific components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and API client
│   │   ├── pages/            # Page components
│   │   ├── stores/           # Zustand state stores
│   │   ├── styles/           # CSS styles
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                  # Express backend API
    ├── src/
    │   ├── controllers/      # Route controllers
    │   ├── middleware/       # Express middleware
    │   ├── models/           # Mongoose models
    │   ├── routes/           # API routes
    │   ├── services/         # Business logic
    │   └── utils/            # Utilities
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd saas-app/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - Set MONGODB_URI
# - Set JWT_SECRET

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd saas-app/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile

### Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PATCH /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/invites` - Invite member
- `POST /api/teams/:id/leave` - Leave team

### Subscriptions
- `GET /api/subscription` - Get current subscription
- `POST /api/subscription/upgrade` - Upgrade plan
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/resume` - Resume subscription
- `GET /api/subscription/billing-history` - Get billing history

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Routing
- **HeadlessUI** - Accessible UI components

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Validation

## Agent Ownership

This application is designed as a workspace for the multi-agent AI development system:

| Agent | Ownership |
|-------|-----------|
| **Frontend Agent** | `frontend/**` |
| **Backend Agent** | `backend/**` |
| **UI Designer Agent** | `frontend/src/components/ui/**` |
| **QA Agent** | Tests |
| **Security Agent** | Auth, middleware |

## Development

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits

### Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### Building
```bash
# Frontend build
cd frontend && npm run build

# Backend build
cd backend && npm run build
```

## License

MIT
