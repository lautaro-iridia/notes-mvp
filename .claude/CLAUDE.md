# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thought Capture is a notes application built for Iridia Labs. It's a React + TypeScript SPA that allows users to create, organize, and link notes of three types: notes, thoughts, and ideas. The UI is in Spanish.

## Development Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint with zero warnings policy
npm run preview  # Preview production build
```

## Architecture

### State Management
- No external state library; uses React hooks with localStorage persistence
- `useLocalStorage` hook wraps all persistent state
- Storage keys defined in `src/utils/storage.ts` (`thought-capture-notes`, `thought-capture-categories`)

### Core Data Flow
```
App.tsx (orchestrator)
  ├── useNotes() - CRUD operations for notes, filtering, linking
  ├── useCategories() - CRUD for categories with default set
  └── useTheme() - dark/light mode via ThemeContext
```

### Key Concepts
- **Note types**: `'note' | 'thought' | 'idea'` - each has different icon/color in UI
- **Note linking**: Bidirectional - linking A→B also links B→A (handled in `useNotes.linkNotes`)
- **Pinned notes**: Always sort to top, then by `updatedAt` descending

### Path Alias
`@/*` maps to `src/*` (configured in both vite.config.ts and tsconfig.json)

### Styling
- Tailwind CSS with dark mode via `class` strategy
- Iridia Labs brand colors defined in `tailwind.config.js` under `iridia.*` and `glass.*`
- Custom fonts: Zain (display), Merriweather (body)
- `cn()` utility in `src/utils/helpers.ts` for conditional class joining
