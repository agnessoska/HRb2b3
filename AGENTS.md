# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
- **Stack**: React 19, Vite 7, TypeScript 5, Tailwind CSS 3, Supabase
- **State Management**: Zustand, React Query (@tanstack/react-query)
- **Routing**: React Router 7
- **UI Components**: shadcn/ui (Radix UI + Tailwind), Lucide React icons
- **Forms**: React Hook Form + Zod
- **I18n**: i18next (ru/en/kk)

## Build & Run Commands
- `npm run dev`: Start development server
- `npm run build`: Type check and build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

## Code Style & Conventions
- **Imports**: Use `@/` alias for imports from `src/` (configured in `vite.config.ts` & `tsconfig.app.json`).
- **File Editing**: 
    - ALWAYS read the full file before editing.
    - PREFER `apply_diff` (replace_in_file) over full file rewrites.
    - If `apply_diff` fails, try smaller chunks or re-read.
    - Use `write_to_file` ONLY for new files or after multiple failed diff attempts.
    - ALWAYS re-read file before `write_to_file` to ensure no content loss.
    - NEVER rewrite translation files or log files completely; use diffs.
- **Production Ready**: No placeholders, TODOs, or stubs. If unavoidable, log them explicitly.
- **Supabase**: Functions located in `supabase/functions`. Migrations in `supabase/migrations`.

## Testing
- No explicit test script in `package.json`. Check for test files in `src/` or specific test configurations if testing is required.

## Architecture
- **Features**: Organized by domain in `src/features/` (e.g., `auth`, `chat`, `candidate-management`).
- **Shared**: Common utilities, hooks, and UI in `src/shared/`.
- **Pages**: Route components in `src/pages/`.
- **Providers**: App-wide providers in `src/app/providers/`.