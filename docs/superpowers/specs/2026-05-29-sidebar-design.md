# Sidebar / App Shell — Design

**Date:** 2026-05-29
**Branch:** `feature/sidebar` (off `development`)
**Status:** Design approved, pending implementation plan

## Goal

Replace the current full-width dark top header bar with a left **sidebar** navigation on authenticated pages, introducing a second destination (**Estadísticas**) alongside Pacientes and adding a **logout** control (which the app currently lacks). This is the navigation shell that the statistics feature (#4) will live in. Built desktop-first; the mobile drawer is the next sub-project (#1 responsive).

## Decisions (locked)

- **Sidebar replaces the top bar.** Authenticated pages get a left sidebar via a Next.js `(app)` route group; login (`/`) becomes bare (no bar, no sidebar).
- **Add logout** to the sidebar (`supabase.auth.signOut()` + clear `localStorage.accessToken` + redirect to `/`).
- **Desktop-first.** Fixed-width sidebar on all widths for now; the mobile drawer is task #1.
- Create an **`/estadisticas` placeholder** page so the nav link works; feature #4 fills it in.

## Architecture

### Route group `(app)`

Route groups (parenthesized dirs) do NOT change URLs — `/pacientes` stays `/pacientes`.

- Move `src/app/pacientes/` → `src/app/(app)/pacientes/`
- Move `src/app/paciente/` → `src/app/(app)/paciente/`
- Create `src/app/(app)/estadisticas/page.tsx` (placeholder)
- Create `src/app/(app)/layout.tsx` — renders the sidebar + a `<main>` for children
- `src/app/page.tsx` (login) stays at root → bare
- `src/app/layout.tsx` (root) loses the top header bar; keeps `<html>/<body>`, font, metadata, globals import

Use `git mv` for the moves (preserves history; no content edit → no encoding risk — see [[reference-crlf-encoding-gotcha]]).

### Import fixes after the move

Moving into `(app)/` adds one directory level, breaking relative imports in the moved files. Convert them to aliases (move-safe). Add a `@/types/*` alias to `tsconfig.json` for the project-root `types/` dir (the existing `@/*` → `./src/*` can't reach it).

`tsconfig.json` `compilerOptions.paths`:
```json
"paths": {
  "@/*": ["./src/*"],
  "@/types/*": ["./types/*"]
}
```

Conversions (all ASCII — encoding-safe via Edit/sed):
- In `src/app/(app)/pacientes/page.tsx`: `../ui/*` → `@/app/ui/*` (search, buttons, Table, skeletons, Dialog, NewPacienteDialogBody), `../utils/supabaseClient` → `@/app/utils/supabaseClient`, `../../../types/supabase` → `@/types/supabase`.
- In `src/app/(app)/pacientes/pacientes-component.tsx`: `../../../types/supabase` → `@/types/supabase`, `../ui/*` → `@/app/ui/*` (Dialog, NewPacienteDialogBody, skeletons, buttons, Table, search, EditPacienteDialogBody).
- In `src/app/(app)/pacientes/useInfinitePacientes.ts`: `../utils/supabaseClient` → `@/app/utils/supabaseClient`, `../../../types/supabase` → `@/types/supabase`.
- In `src/app/(app)/paciente/[id]/paciente-component.tsx`: `../../../../types/supabase` → `@/types/supabase`. (Its other imports already use `@/app/...` or `./paciente-component` — move-safe.)
- `src/app/(app)/paciente/[id]/page.tsx` already uses `@/app/...` + `./paciente-component` — no change needed.

## Components

### `src/app/ui/Sidebar/Sidebar.tsx` (client component)

Uses the `sidebar-*` tokens defined in the color-tokens work. Structure:
- **Branding** (top): `FaMicroscope` icon + concise label `Anat. Patológica` (the full clinic title is too long for a sidebar). In `sidebar-text-active` color.
- **Nav** (`<nav>`, flex-1): items `Pacientes` (`/pacientes`, UsersIcon) and `Estadísticas` (`/estadisticas`, ChartBarIcon). Active state via `usePathname()`:
  - Pacientes active when `pathname.startsWith("/paciente")` (covers both `/pacientes` list and `/paciente/[id]` detail).
  - Estadísticas active when `pathname.startsWith("/estadisticas")`.
  - Active → `bg-sidebar-item-active text-sidebar-text-active`; inactive → `hover:bg-sidebar-item-hover`.
- **Logout** (bottom): "Salir" button (`ArrowRightStartOnRectangleIcon`). Handler: `await supabase.auth.signOut(); localStorage.removeItem("accessToken"); router.push("/");`.
- Container: `aside` with `bg-sidebar text-sidebar-text`, fixed width (`w-60`), `h-screen`, vertical flex.

Heroicons (`@heroicons/react/24/outline`) and `react-icons/fa` are already dependencies; `clsx` too.

### `src/app/(app)/layout.tsx`

```tsx
import { Sidebar } from "@/app/ui/Sidebar/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
```

### `src/app/(app)/estadisticas/page.tsx` (placeholder)

```tsx
export default function EstadisticasPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-fg">Estadísticas</h1>
      <p className="mt-2 text-fg-muted">Próximamente.</p>
    </div>
  );
}
```

### `src/app/layout.tsx` (root, after edit)

Remove the header-bar `<div>`, the `FaMicroscope` import, and the `Link` import. Keep `<html>/<body>`, Inter font, metadata, `./globals.css`. Result: a minimal root layout wrapping `{children}`.

## Responsive (deferred to #1)

Built desktop-first: `w-60` fixed sidebar, content in `flex-1`. On small screens the 240px sidebar is cramped but functional. Task #1 converts it to an off-canvas drawer (hamburger toggle). The sidebar is isolated in its own component so that change is contained.

## Verification

No automated tests. Visual + build:
1. `pnpm run build` succeeds.
2. `/pacientes` and `/paciente/[id]` render with the sidebar; URLs unchanged.
3. Login (`/`) renders bare (no sidebar, no top bar).
4. Active nav highlight is correct on list, detail, and estadísticas.
5. Logout clears session and redirects to `/`.
6. `/estadisticas` placeholder loads.
7. Existing patient flows (list, search, infinite scroll, create/edit, PDF) still work.

## Done criteria

1. `(app)` route group with the moved pages + new layout + estadísticas placeholder.
2. Sidebar component using `sidebar-*` tokens, with active states + logout.
3. Root layout no longer renders the top bar; login is bare.
4. `@/types/*` alias added; all moved-file imports resolve.
5. `pnpm build` passes; visual checks pass.

## Non-goals

- Mobile drawer / responsive (task #1).
- Building the statistics feature (task #4) — only the placeholder route.
- Route auth-protection / middleware (the app has none today; out of scope here).
- Changing the login page's own design beyond losing the now-removed top bar.
- Any new dependency.