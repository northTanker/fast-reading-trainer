<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Tech Stack

- Next.js 16.2 (App Router, Turbopack)
- React 19.2
- TypeScript 5 (strict mode)
- Tailwind CSS v4 (no `tailwind.config.js` — uses `@import "tailwindcss"` + `@theme` blocks in CSS)

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (includes tsc)
npm run lint     # ESLint with eslint-config-next rules
npx tsc --noEmit # Type-check only (not included in lint)
```

**Verification order:** `npx tsc --noEmit` → `npx eslint . --ext .ts,.tsx` → `npm run build`

## Architecture
- **No `src/` directory** — top-level `app/`, `components/`, `lib/`, `hooks/`, `types/`
- **Path alias:** `@/*` → project root (`./*`)
- **Fully client-side SPA** — every component uses `"use client"`. No server components, no API routes, no database.
- **Persistence:** `localStorage` only. Keys: `reading-history` (SessionRecord[]) and `gamification-data` (GamificationData).
- **External sync pattern:** Components reading localStorage use `useSyncExternalStore` with `focus` and `storage` event subscriptions — not `useEffect` + `setState`. See `components/Gamification.tsx` and `components/History.tsx`.

## Directory Layout

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages (`layout.tsx`, `page.tsx`, `globals.css`) |
| `components/` | UI components: `TextInput`, `Reader`, `Controls`, `ProgressPanel`, `SessionSummary`, `Gamification`, `History` |
| `hooks/` | `useReader` (RSVP state machine), `useLocalStorage` (SSR-safe) |
| `lib/` | Pure functions: `tokenizer`, `orp`, `session`, `storage`, `gamification`, `samples` |
| `types/` | `index.ts` — shared TypeScript interfaces |

## State Machine (useReader)

```
idle → reading → paused → reading → finished → idle (on new session)
                 ↘ finished
```

- Word index advances via `setInterval` at `60000 / WPM` ms
- Auto-pauses when tab loses visibility (`document.visibilitychange`)
- WPM changes during reading restart the interval immediately

## Key Files to Read Before Editing
- `types/index.ts` — all shared types
- `hooks/useReader.ts` — core reading logic
- `app/page.tsx` — state orchestration, keyboard shortcuts

## ECC Operator Workflow

This project strictly adheres to the **ECC (Harness-Native Operator System)** workflow principles:

### Development Workflow
1. **Research First**: Search existing implementations and library docs before writing new code.
2. **Plan First**: Always create an `implementation_plan.md` before execution. Break down phases and risks.
3. **TDD (Test-Driven Development)**: Write tests first (RED), implement (GREEN), and refactor (IMPROVE).
4. **Code Review & Verification**: Verify all code against edge cases, address high-priority issues, and ensure zero build errors before committing.

### TypeScript & React Coding Style
- **Strict Typing**: Exported functions and components MUST have explicit parameter and return types.
- **Interfaces vs Types**: Use `interface` for object shapes that may be extended, and `type` for unions/intersections.
- **No `any`**: Use `unknown` for external data and narrow it safely.
- **Immutability**: Never mutate objects or state directly; always use spread syntax or immutable patterns.
- **Validation**: Use schema validation (like Zod) for external inputs when necessary.
- **No Console Logs**: Do not leave `console.log` in production code.
