# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Iridia Notes is a notes application built for Iridia Labs. It's a fullstack monorepo with a React + TypeScript frontend and a FastAPI + PostgreSQL backend. Users can create, organize, and link notes of three types: notes, thoughts, and ideas. The UI is in Spanish.

## Project Structure

```
notes-mvp/
├── frontend/          # React + TypeScript SPA
├── backend/           # FastAPI Python backend
├── docker/            # Dockerfiles for each service
├── scripts/           # Entrypoint and utility scripts
├── tests/             # Test suites for frontend and backend
└── docs/              # Documentation (includes brand manual)
```

## Development Commands

### Docker (Recommended)
```bash
make dev              # Start development environment with hot reload
make prod             # Start production environment
make down             # Stop all containers
make logs             # View logs from all services
make db-shell         # Open PostgreSQL shell
make migrate          # Run database migrations
```

### Frontend (Local)
```bash
cd frontend
npm install           # Install dependencies
npm run dev           # Start Vite dev server (port 5173)
npm run build         # TypeScript check + Vite production build
npm run lint          # ESLint with zero warnings policy
npm run preview       # Preview production build
```

### Backend (Local)
```bash
cd backend
pip install -r requirements.txt  # Install dependencies
uvicorn app.main:app --reload    # Start FastAPI dev server (port 8000)
alembic upgrade head             # Run migrations
```

## Architecture

### Frontend (`/frontend`)

#### State Management
- **React Query (TanStack Query)** for all server state (notes, categories)
- **React Context** for auth (`AuthContext`) and theme (`ThemeContext`)
- **API client layer** in `src/api/` with axios

#### Core Data Flow
```
App.tsx (orchestrator)
  ├── AuthContext - Authentication state (JWT tokens, user info)
  ├── ThemeContext - dark/light mode
  └── React Query - Server state management
      ├── useNotes() - CRUD operations via API (uses React Query)
      └── useCategories() - Categories via API (uses React Query)
```

#### Key Hooks
- `useAuth()` - Login, register, logout, current user
- `useNotes()` - All note operations (create, update, delete, pin, link)
- `useCategories()` - Category management

#### Key Concepts
- **Note types**: `'note' | 'thought' | 'idea'` - each has different icon/color in UI
- **Note linking**: Bidirectional - linking A→B also links B→A (handled server-side)
- **Pinned notes**: Always sort to top, then by `updatedAt` descending
- **Migration**: MigrationBanner component handles importing localStorage data to API for users migrating from the old version

#### Path Alias
`@/*` maps to `src/*` (configured in both vite.config.ts and tsconfig.json)

#### Styling
- Tailwind CSS with dark mode via `class` strategy
- **Iridia Labs brand colors** defined in `tailwind.config.js`:
  - `iridia-indigo`: #4B0082 (primary)
  - `iridia-orange`: #FF9B00 (accent)
  - `iridia-cream`: #F0EEE9 (light background)
  - `iridia-lavender`: #B2A5FF (secondary)
  - `iridia-black`: #0D0E0E (dark background)
- **Glass morphism** styles: `glass`, `glass-card`, `glass-input`, `glass-button`
- Custom fonts: Zain (display/titles), Merriweather (body text)
- `cn()` utility in `src/utils/helpers.ts` for conditional class joining

### Backend (`/backend`)

#### Structure
```
backend/
├── app/
│   ├── main.py           # FastAPI application entry
│   ├── config.py         # Pydantic settings
│   ├── database.py       # SQLAlchemy async engine
│   ├── models/           # SQLAlchemy models (User, Note, Category, NoteLink)
│   ├── schemas/          # Pydantic schemas for API validation
│   ├── api/v1/           # API routes (auth, notes, categories)
│   ├── core/             # Auth, security, dependencies
│   └── services/         # Business logic
├── alembic/              # Database migrations
└── requirements.txt
```

#### Key Technologies
- FastAPI with async support
- SQLAlchemy 2.0 with asyncpg
- Alembic for migrations
- PostgreSQL with pgvector extension (for future semantic search)
- JWT authentication with python-jose
- Password hashing with passlib + bcrypt (pinned to 4.0.1 for compatibility)

### Database Schema

- **users**: User accounts with email/password auth
- **notes**: User notes with type, content, embedding vector (for future AI features)
- **categories**: User-defined categories
- **note_categories**: Many-to-many relationship
- **note_links**: Bidirectional note links (graph structure)

## API Endpoints

### Auth (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - Login, returns JWT (OAuth2 password flow)
- `POST /refresh` - Refresh access token
- `GET /me` - Current user info

### Notes (`/api/v1/notes`)
- `GET /` - List notes (with filters: type, category_id, search, pinned_only)
- `POST /` - Create note
- `GET /{id}` - Get note
- `PATCH /{id}` - Update note
- `DELETE /{id}` - Delete note
- `PATCH /{id}/pin` - Toggle pin
- `POST /{id}/links/{target_id}` - Link notes
- `DELETE /{id}/links/{target_id}` - Unlink notes
- `POST /import` - Import from localStorage (for migration)

### Categories (`/api/v1/categories`)
- `GET /` - List categories
- `POST /` - Create category
- `GET /{id}` - Get category
- `PATCH /{id}` - Update category
- `DELETE /{id}` - Delete category

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `SECRET_KEY` - JWT signing key
- `DATABASE_URL` - PostgreSQL connection string (use asyncpg driver)
- `VITE_API_URL` - Backend URL for frontend (http://localhost:8000)
- `CORS_ORIGINS` - Allowed origins for CORS

## Brand Guidelines

See `docs/vibe_trace/manual-de-marca-iridia-labs.pdf` for the full brand manual.

### Colors
- Primary: Indigo (#4B0082)
- Accent: Orange (#FF9B00)
- Light BG: Cream (#F0EEE9)
- Dark BG: Black (#0D0E0E)
- Secondary: Lavender (#B2A5FF)

### Fonts
- Display/Titles: Zain
- Body text: Merriweather
- Logo: Boldonse

### Style
- Liquid glass / glass morphism effects
- Minimalist, elegant, Apple-inspired aesthetic
- Eye logo with indigo iris and orange highlight
