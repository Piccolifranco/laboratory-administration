# Responsive Design Pass — Design

**Date:** 2026-05-30
**Branch:** `feature/responsive` (off `development`)
**Status:** Design approved, pending implementation plan

## Goal

Make the whole app mobile-friendly in a professional way: a sidebar that becomes an off-canvas drawer on phones, data tables that become stacked cards, dialogs/forms that are comfortable on small screens, and no horizontal overflow anywhere. Desktop (`md+`) appearance is unchanged.

## Decisions (locked)

- **Breakpoint:** Tailwind `md` (768px). Below `md` = mobile layout; `md+` = current desktop layout. (The app already uses `md:` in places.)
- **Tables → stacked cards on mobile** (not horizontal scroll).
- **Full polish** across all screens (sidebar, tables, dialogs, forms, login, search row).
- Mobile table **sorting is out of scope** — mobile cards show the default (query) order; click-to-sort headers stay desktop-only.
- **No new dependencies.**

## Areas

### 1. Sidebar → off-canvas drawer

Today `(app)/layout.tsx` renders `<Sidebar/>` + `<main>`; the sidebar is a fixed `w-60 h-screen` column (fine on desktop, takes 240px on a phone).

Introduce a client **`AppShell`** component (`src/app/ui/Sidebar/AppShell.tsx`) that owns drawer state and wraps the layout:
- **`md+`:** sidebar static in-flow, exactly as now; no mobile top bar.
- **below `md`:** a slim top bar (`md:hidden`) with a hamburger button + brand; the sidebar renders as a fixed-position drawer that slides in (`-translate-x-full` closed → `translate-x-0` open) over a dimmed backdrop. Drawer + backdrop are `md:hidden`/reset at `md+`.
- Drawer **closes** on: backdrop click, a nav-item click, and route change (`usePathname` effect).
- `(app)/layout.tsx` (server) becomes `<AppShell>{children}</AppShell>`.
- `Sidebar.tsx` stays the nav content; it gains an optional `onNavigate?: () => void` prop that the nav `<Link>`s and the logout call, so AppShell can close the drawer. On desktop `onNavigate` is a no-op.

Mechanism is plain Tailwind transforms + a `useState` boolean — no Headless UI dependency needed (though it's available).

### 2. Data tables → cards on mobile

Two tables: the patient **list** (`src/app/ui/Table.tsx`) and the **visitas** table (`src/app/(app)/paciente/[id]/paciente-component.tsx`).

Pattern for each: keep the existing `<table>` but wrap it in `hidden md:block`; add a `md:hidden` card list rendering the **same data array**:
- **List cards** (`Table.tsx`): per paciente — last+first name as the card title (prominent), then `Edad`, `DNI`, `Doctor/a`, `Obra Social`, `Última Visita` as labeled lines; the whole card is the row's existing click/edit affordance. Uses tokens (`bg-surface`, `border-border`, `text-fg`, `text-fg-subtle`).
- **Visita cards** (`paciente-component.tsx`): per visita — diagnosis title as the card title, then `Doctor/a`, `Fecha`, the `InvoiceStatus` badge, and the action buttons (Edit / DownloadPDF) row.
- **Sorting:** the list table's click-to-sort headers remain desktop-only. Mobile cards render in the array's current order (already newest-first from the query for the list; the visitas list uses its existing reversed order). No mobile sort control in this pass.

### 3. The New Visita form

`src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx` uses `grid grid-cols-3 gap-x-8` (line ~129) — three cramped columns on a phone. Change to responsive columns: `grid-cols-1 md:grid-cols-3` (single column on mobile, three at `md+`). Also relax the container `max-w-[90%]` so it isn't artificially narrow on small screens (e.g. `w-full max-w-[90%]` is fine; verify it doesn't overflow). Inputs are already `w-full`.

### 4. Other forms

`NewPacienteDialogBody` and `EditPacienteDialogBody` are already single-column (`flex flex-col`, `space-y-4`) — no structural change expected; verify they look right on mobile and adjust padding only if needed.

### 5. Dialog shell

`src/app/ui/Dialog.tsx`: the panel is already `w-[100%] md:w-[90%]` with `max-h-[100vh]`. Polish for mobile: ensure the body scrolls within the viewport (internal `overflow-y-auto`), comfortable padding, and that a tall form (New Visita) doesn't get cut off. No behavioral change on desktop.

### 6. Smaller polish

- **Search + create row** (`pacientes-component.tsx`): confirm it wraps/spaces cleanly on mobile (search `flex-1`, create button icon-only via existing `hidden md:block` label). Adjust gap/wrap if it crowds.
- **Login** (`src/app/page.tsx`): the `max-w-lg` card with `p-8` — add horizontal page padding so the card isn't edge-to-edge on small phones (e.g. wrapper `px-4`).
- **Patient detail header** (`paciente-component.tsx`): the CreateVisita button area — verify spacing on mobile.

## Verification

No automated tests. Manual at two widths (browser devtools): **~375px (phone)** and **desktop**:
1. Sidebar: desktop static; mobile shows top bar + hamburger, drawer opens/closes (backdrop, nav click, route change), nav works.
2. Patient list: cards on mobile / table on desktop; infinite scroll + search work on both.
3. Patient detail: visita cards on mobile / table on desktop; PDF + edit work.
4. New Visita form: single column on mobile, three columns on desktop; submit works.
5. New/Edit Paciente dialogs and the Dialog shell: usable on mobile, no cut-off; validation errors visible.
6. Login: centered with padding on a phone.
7. No horizontal page overflow on any screen at 375px.
8. Desktop appearance unchanged throughout.

## Done criteria

1. `AppShell` drawer working; `(app)/layout.tsx` uses it; `Sidebar` has `onNavigate`.
2. Both tables render as cards below `md`, tables at `md+`.
3. New Visita form columns responsive; dialog/forms usable on mobile.
4. Login + search row polished for small screens.
5. `pnpm build` passes; encoding sweep clean; desktop visually unchanged; no 375px horizontal overflow.

## Non-goals

- Interactive sorting on mobile cards (default order only).
- Any non-responsive redesign or color/spacing-token changes beyond what responsiveness needs.
- Statistics feature (#4) — the `/estadisticas` placeholder is trivial and already responsive.
- New dependencies.
- Touching the PDF components (print output, not screen).