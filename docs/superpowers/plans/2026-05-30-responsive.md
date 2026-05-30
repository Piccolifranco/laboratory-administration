# Responsive Design Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline). Verification is a visual check at ~375px + desktop that only the user can confirm. Repo is CRLF UTF-8 — use Edit/Write only (never raw PowerShell/Node file writes; they corrupt encoding). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make the app mobile-friendly at `md` (768px): sidebar → off-canvas drawer, tables → stacked cards, forms/dialogs/login polished; desktop unchanged.

**Architecture:** A client `AppShell` wraps the `(app)` layout and owns drawer state (hamburger top bar + sliding drawer + backdrop on mobile; static sidebar on `md+`). Tables dual-render (table `hidden md:block` + card list `md:hidden`). The New Visita form grid becomes responsive.

**Tech Stack:** Tailwind 4 (`md:` + transforms), React 19 client state, @heroicons/react, clsx. No new deps.

**Verification model:** No automated tests. Each task: `pnpm run build` succeeds; visual check at 375px + desktop at the end.

---

## Task 1: Sidebar drawer (AppShell) + `onNavigate`

**Files:**
- Modify: `src/app/ui/Sidebar/Sidebar.tsx`
- Create: `src/app/ui/Sidebar/AppShell.tsx`
- Modify: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Add `onNavigate` to `Sidebar`**

In `src/app/ui/Sidebar/Sidebar.tsx`:
- Change the component signature to accept the prop:
  ```tsx
  export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  ```
- On each nav `<Link>`, add `onClick={onNavigate}`.
- In `handleLogout`, call `onNavigate?.()` before the redirect (so the drawer closes). The function head becomes:
  ```tsx
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("accessToken");
    onNavigate?.();
    router.push("/");
  };
  ```

- [ ] **Step 2: Create `src/app/ui/Sidebar/AppShell.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { FaMicroscope } from "react-icons/fa";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:flex">
      {/* Mobile top bar (hidden on desktop) */}
      <div className="flex items-center gap-3 bg-sidebar px-4 py-3 text-sidebar-text-active md:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <FaMicroscope className="text-xl" />
        <span className="font-semibold">Anat. Patológica</span>
      </div>

      {/* Backdrop (mobile only, when open) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: off-canvas drawer on mobile, static column on desktop */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <main className="min-h-screen flex-1">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Use AppShell in `src/app/(app)/layout.tsx`**

Replace the file with:
```tsx
import { AppShell } from "@/app/ui/Sidebar/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 4: Build**

Run: `pnpm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```
git add "src/app/ui/Sidebar/Sidebar.tsx" "src/app/ui/Sidebar/AppShell.tsx" "src/app/(app)/layout.tsx"
git commit -m "feat(responsive): sidebar becomes an off-canvas drawer on mobile via AppShell"
```
(No Co-Authored-By trailer.)

---

## Task 2: Patient list → cards on mobile

**Files:** Modify: `src/app/ui/Table.tsx`

The current return is `<div className="flex flex-col"> <div className="overflow-x-auto"> …table… </div></div>`. Keep the table for `md+`, add a mobile card list.

- [ ] **Step 1: Gate the existing table to desktop**

Change the table wrapper so the whole `overflow-x-auto` block only shows at `md+`. The line:
```tsx
      <div className="overflow-x-auto">
```
becomes:
```tsx
      <div className="hidden overflow-x-auto md:block">
```

- [ ] **Step 2: Add a mobile card list**

Immediately AFTER that closing `</div>` of the `overflow-x-auto md:block` block (i.e., still inside the outer `<div className="flex flex-col">`, before its closing `</div>`), insert:

```tsx
      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {sortedPacientes.length === 0 && loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg bg-surface-sunken"
              />
            ))}
          </>
        ) : (
          sortedPacientes.map((paciente) => {
            const handleDeletePacienteCard = async () => {
              await deletePaciente(paciente.id);
              router.refresh();
            };
            return (
              <div
                key={paciente.id}
                className="rounded-lg border border-border bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/paciente/${paciente.id}`}
                    className="text-md font-medium text-fg"
                  >
                    {paciente?.lastName}, {paciente.firstName}
                  </Link>
                  <div className="flex gap-2">
                    <EditPaciente
                      paciente={paciente}
                      onEditPaciente={onEditPaciente}
                    />
                    <DeletePaciente onClick={handleDeletePacienteCard} />
                  </div>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-fg-subtle">
                  <div>
                    <dt className="inline font-medium">Edad: </dt>
                    <dd className="inline">{paciente?.age ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">DNI: </dt>
                    <dd className="inline">{paciente?.dni ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Doctor/a: </dt>
                    <dd className="inline">{paciente?.doctor ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">OS: </dt>
                    <dd className="inline">{paciente?.obraSocial ?? "-"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="inline font-medium">Última visita: </dt>
                    <dd className="inline">
                      {paciente?.visitas
                        ? format(
                            new Date(paciente.visitas[0].date),
                            "dd/MM/yyyy"
                          )
                        : "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })
        )}
        {loading && sortedPacientes.length > 0 && (
          <div className="h-28 animate-pulse rounded-lg bg-surface-sunken" />
        )}
      </div>
```

(`sortedPacientes`, `deletePaciente`, `router`, `Link`, `format`, `EditPaciente`, `DeletePaciente` are all already imported/in scope in this file.)

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```
git add src/app/ui/Table.tsx
git commit -m "feat(responsive): patient list renders as cards on mobile, table on desktop"
```
(No trailer.)

---

## Task 3: Visitas table → cards on mobile

**Files:** Modify: `src/app/(app)/paciente/[id]/paciente-component.tsx`

The visitas table lives in the `overflow-x-auto` block (around the `<div className="overflow-x-auto">` containing `<table>`). Keep it for desktop, add mobile cards from `reorderedVisitas`.

- [ ] **Step 1: Gate the table to desktop**

Find the wrapper:
```tsx
      <div className="overflow-x-auto">
```
(the one wrapping the visitas `<table>`) and change it to:
```tsx
      <div className="hidden overflow-x-auto md:block">
```

- [ ] **Step 2: Add a mobile card list after that block**

Immediately after the closing `</div>` of that `overflow-x-auto md:block` wrapper, insert:

```tsx
      {/* Mobile: visita cards */}
      <div className="space-y-3 md:hidden">
        {reorderedVisitas?.map((visita) => (
          <div
            key={visita.id}
            className="rounded-lg border border-border bg-surface p-4 shadow-sm"
          >
            <div className="text-md font-medium text-fg">
              {visita[visita.type]?.title}
            </div>
            <dl className="mt-2 space-y-1 text-sm text-fg-subtle">
              <div>
                <dt className="inline font-medium">Doctor/a: </dt>
                <dd className="inline">
                  {paciente?.doctor ? paciente.doctor : visita.secondaryDoctor}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium">Fecha: </dt>
                <dd className="inline">
                  {visita.date
                    ? format(new Date(visita.date), "dd/MM/yyyy")
                    : ""}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center justify-between">
              <InvoiceStatus amount={visita.amount} status={visita.status} />
              <div className="flex gap-3">
                <EditVisita
                  pacienteId={paciente.id}
                  visita={visita}
                  onEditVisita={() => {
                    setVisitaToEdit(visita);
                  }}
                />
                <DownloadPDF
                  onClick={async () => {
                    const blob = await pdf(
                      <DocumentoPDF visita={visita} paciente={paciente} />
                    ).toBlob();
                    const pdfURL = URL.createObjectURL(blob);
                    window.open(pdfURL, "_blank");
                    removeQueryParams();
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
```

(`reorderedVisitas`, `paciente`, `format`, `InvoiceStatus`, `EditVisita`, `DownloadPDF`, `pdf`, `DocumentoPDF`, `removeQueryParams`, `setVisitaToEdit` are all already in scope in this component.)

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```
git add "src/app/(app)/paciente/[id]/paciente-component.tsx"
git commit -m "feat(responsive): visitas render as cards on mobile, table on desktop"
```
(No trailer.)

---

## Task 4: New Visita form + Dialog mobile polish

**Files:**
- Modify: `src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx`
- Modify: `src/app/ui/Dialog.tsx`

- [ ] **Step 1: Responsive form columns**

In `NewVisitaDialogBody.tsx`, the form grid (around line 129) is:
```tsx
      <div className="p-4 space-y-2 grid grid-cols-3 gap-x-8">
```
Change to single column on mobile, three at `md+`:
```tsx
      <div className="p-4 space-y-2 grid grid-cols-1 gap-x-8 md:grid-cols-3">
```

- [ ] **Step 2: Relax the container max-width on mobile**

In the same file, the container className (around line 126) is:
```tsx
      className="bg-card text-card-foreground shadow-sm w-full max-w-[90%] mx-auto flex flex-col"
```
Change `max-w-[90%]` so it's full width on mobile and capped at `md+`:
```tsx
      className="bg-card text-card-foreground shadow-sm w-full md:max-w-[90%] mx-auto flex flex-col"
```

- [ ] **Step 3: Dialog mobile scroll/padding polish**

In `src/app/ui/Dialog.tsx`, the inner content `<div>` (currently `className="bg-surface flex-1 max-h-[100vh] md:max-h-[100vh] px-4 pt-5 sm:p-6 sm:pb-4"`) — make it scroll within the viewport on mobile:
```tsx
className="bg-surface flex-1 max-h-[90vh] overflow-y-auto px-4 pt-5 sm:p-6 sm:pb-4"
```
(Adds `overflow-y-auto`, caps height at `90vh` so a tall form scrolls instead of overflowing the screen. Desktop visually unchanged — content shorter than 90vh.)

- [ ] **Step 4: Build**

Run: `pnpm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```
git add "src/app/ui/NewVisitaDialogBody/NewVisitaDialogBody.tsx" src/app/ui/Dialog.tsx
git commit -m "feat(responsive): New Visita form single-column on mobile; dialog scrolls on small screens"
```
(No trailer.)

---

## Task 5: Login + search row polish

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/(app)/pacientes/pacientes-component.tsx`

- [ ] **Step 1: Login horizontal padding**

In `src/app/page.tsx`, the outer wrapper is:
```tsx
    <div className="h-[calc(100vh-88px)] bg-surface-sunken flex flex-col justify-center items-center">
```
Two changes: the height assumed an 88px top bar that no longer exists (the bar was removed in the sidebar work) — use `min-h-screen`; and add horizontal padding so the card isn't edge-to-edge:
```tsx
    <div className="min-h-screen bg-surface-sunken flex flex-col justify-center items-center px-4">
```

- [ ] **Step 2: Search + create row spacing**

In `pacientes-component.tsx`, the row is:
```tsx
        <div className="mt-4 flex items-center justify-between gap-2 md:my-4">
```
This is already a flex row with gap; the search is `flex-1` and the create button is icon-only on mobile (label `hidden md:block`). Confirm it doesn't crowd at 375px. If the create button text wrapping is an issue it's already handled. Leave as-is unless the Step-? visual check shows crowding; if so, the safe tweak is keeping `gap-2`. **No change unless visual check fails** — note this is a verify-only step.

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```
git add src/app/page.tsx
git commit -m "fix(responsive): login uses min-h-screen + horizontal padding (top bar removed earlier)"
```
(Only `page.tsx` if `pacientes-component.tsx` was unchanged. If a tweak was needed there, add it too. No trailer.)

---

## Task 6: Verify + encoding sweep + PR

- [ ] **Step 1: Encoding sweep**

Run from repo root:
```
for f in $(git diff --name-only origin/development...HEAD); do [ -f "$f" ] || continue; b=$(head -c3 "$f" | od -An -tx1 | tr -d ' '); [ "$b" = "efbbbf" ] && echo "BOM: $f"; grep -q $'\xc3\x83' "$f" && echo "MOJIBAKE: $f"; done; echo "sweep done"
```
Expected: no BOM / MOJIBAKE lines.

- [ ] **Step 2: Build + lint**

Run: `pnpm run build && pnpm run lint`
Expected: build succeeds; lint shows only pre-existing findings (no new errors).

- [ ] **Step 3: Visual walkthrough (user) at ~375px AND desktop**

Devtools responsive mode at 375px and normal desktop:
- Sidebar: desktop static; mobile shows top bar + hamburger; drawer opens, backdrop dims, closes on backdrop/nav/route-change; nav + logout work.
- Patient list: cards on mobile / table on desktop; search + infinite scroll work both; no horizontal overflow.
- Patient detail: visita cards on mobile / table on desktop; PDF + edit work.
- New Visita dialog: single column on mobile (3 cols desktop); scrolls within screen; submit works.
- New/Edit Paciente dialogs: usable on mobile; validation errors visible.
- Login: centered with side padding on a phone.
- Desktop appearance unchanged everywhere.

- [ ] **Step 4: Push + PR**

```
git push -u origin feature/responsive
gh pr create --base development --title "feat: responsive design pass (mobile-friendly)" --body "<summary: md breakpoint; sidebar -> off-canvas drawer via AppShell; patient list + visitas tables -> stacked cards on mobile; New Visita form single-column on mobile; dialog scrolls on small screens; login padding. Mobile table sort out of scope. No new deps; desktop unchanged. Test plan checklist. Spec + plan links.>"
```

- [ ] **Step 5: Vercel preview check, then done.**

---

## Risks

- **`Bars3Icon` import:** exists in `@heroicons/react@2` outline. If missing, use `Bars3BottomLeftIcon` or the SVG inline.
- **Drawer state across navigation:** the `usePathname` effect closes the drawer on route change; verify it actually fires (App Router updates pathname on client nav).
- **Card/table data divergence:** both layouts map the SAME source array, so they can't drift. The desktop table keeps its interactive sort; mobile uses the array order (documented out-of-scope).
- **`page.tsx` height:** the old `h-[calc(100vh-88px)]` assumed the removed top bar; switching to `min-h-screen` is the correct post-sidebar value (verify login still vertically centered).

## Out of scope (reaffirmed)

- Interactive sort on mobile cards.
- PDF components (print, not screen).
- Statistics feature (#4).
- New dependencies / redesign.