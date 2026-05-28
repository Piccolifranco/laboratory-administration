# Doctor's Signature on PDF Reports — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) — verification is a visual check on the rendered PDFs that only the user can perform. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Dra. Carolina's signature image to all three PDF report types (Pap, Cepillado, Biopsia).

**Architecture:** Five tasks on `feature/pdf-signature` (already cut off `development`). Task 0 confirms the signature PNG is in place; Task 1 adds the style; Tasks 2–4 each add the signature to one report component (separate commits so any per-report visual issue is per-commit reviewable); Task 5 pushes and opens the PR.

**Tech Stack:** Same as current — Next.js 16, React 19, `@react-pdf/renderer` 4, Tailwind 4, pnpm 11.

**Verification model:** No automated tests. Every Task 2–4 verification is "run the app, generate that report type's PDF, look at it." Visual judgment is by you.

---

## Task 0: Pre-flight — confirm the signature asset is in place

**Files:** none modified.

- [ ] **Step 1: Confirm branch + clean tree**

Run: `git status && git branch --show-current`
Expected: `On branch feature/pdf-signature, nothing to commit, working tree clean` (plus the spec commit already on this branch).

- [ ] **Step 2: Confirm the signature PNG exists at the expected path**

Run: `ls public/images/doctor_signature.png`
Expected: file listed.

If the file is missing, **stop**. The user needs to convert the PDF source to PNG (transparent background) and drop it at `public/images/doctor_signature.png` before proceeding.

- [ ] **Step 3: Quick sanity-check on the PNG**

Run: `file public/images/doctor_signature.png` (on bash/git-bash) or open the file in any image viewer.
Expected: it is a PNG, has visible content (the signature), and the background is transparent (in an image viewer, a checkerboard pattern indicates transparency).

If the background is white instead of transparent, the conversion did not preserve alpha. Stop and redo the conversion.

- [ ] **Step 4: No commit** (Task 0 produces no file changes).

---

## Task 1: Add the `signature` style to the StyleSheet

**Files:** Modify: `src/app/ui/pdfComponents.tsx`

- [ ] **Step 1: Locate the `StyleSheet.create(...)` block**

Open `src/app/ui/pdfComponents.tsx`. The styles are declared at the top of the file, starting around line 23. The block ends around line 79 with `},\n});`. The last style entry in the block is `svgContainer` (lines 71–78).

- [ ] **Step 2: Add the `signature` style**

Add a new entry to the `StyleSheet.create(...)` object, after the `svgContainer` entry and before the closing `})`:

```ts
  svgContainer: {
    position: "absolute",
    bottom: 20,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  signature: {
    width: 150,
    marginTop: 30,
    alignSelf: "flex-end",
  },
});
```

That's a new four-line block. The `signature` key sits at the same indentation level as `svgContainer` and the other style entries.

- [ ] **Step 3: Verify the build still passes (no `<Image>` using the style yet, but the file should still compile)**

Run: `pnpm run build`
Expected: build succeeds. (An unused style is fine — TypeScript and the bundler don't complain about object keys that nothing reads.)

- [ ] **Step 4: Commit**

```
git add src/app/ui/pdfComponents.tsx
git commit -m "feat(pdf): add 'signature' style for the doctor signature image

Adds a new style entry for the upcoming signature <Image> elements.
Right-aligned, width 150pt, 30pt top margin to separate it from the
last diagnosis line. Used by the three report components in the
following commits."
```

---

## Task 2: Add the signature to `PapDiagnosisComponent`

**Files:** Modify: `src/app/ui/pdfComponents.tsx`

- [ ] **Step 1: Locate the end of the Pap component's body section**

Open `src/app/ui/pdfComponents.tsx`. Find the `PapDiagnosisComponent` (starts around line 82). Inside it, the inner `<View style={styles.section}>` block ends with the line:

```tsx
      <Text style={styles.content}>Nota: {visita[visita.type]?.notes}</Text>
    </View>
```

(`</View>` is the closing tag of the `styles.section` `<View>`.)

- [ ] **Step 2: Add the signature `<Image>` just before the closing `</View>`**

Insert the new line immediately after the Nota text and before the `</View>`:

```tsx
      <Text style={styles.content}>Nota: {visita[visita.type]?.notes}</Text>
      <Image src="/images/doctor_signature.png" style={styles.signature} />
    </View>
```

The `Image` import is already in the file (imported from `@react-pdf/renderer` at the top — verify via `grep "Image" src/app/ui/pdfComponents.tsx | head -3`). No new import needed.

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: build succeeds.

- [ ] **Step 4: Visual smoke-test the Pap report**

Run: `pnpm dev`. Log in, navigate to a patient with a Pap visit, download the PDF. Verify:
- Signature appears right-aligned, below the "Nota:" line, on the same page as the rest of the diagnosis.
- Signature renders the actual signature (not a white box / not a placeholder).
- The microscope-logo footer is still at bottom-right of every page (unchanged).

If the signature looks wrong (too big, too small, wrong position, white box around it), stop and tell the user. Tunable parameters: `signature.width`, `signature.marginTop`, the transparent-PNG quality.

Stop the dev server with Ctrl+C.

- [ ] **Step 5: Commit**

```
git add src/app/ui/pdfComponents.tsx
git commit -m "feat(pdf): add doctor signature to Pap report

Adds an <Image> element rendering /images/doctor_signature.png as the
last element of the document body in PapDiagnosisComponent. Visual
verification passed on a real Pap visit."
```

---

## Task 3: Add the signature to `CepilladoDiagnosisComponent`

**Files:** Modify: `src/app/ui/pdfComponents.tsx`

Same pattern as Task 2.

- [ ] **Step 1: Locate the end of the Cepillado component's body section**

Find `CepilladoDiagnosisComponent` (starts around line 172). Inside it, the inner `<View style={styles.section}>` block ends with:

```tsx
      <Text style={styles.content}>
        Nota: {visita.cepilladoDiagnosis.notes}
      </Text>
    </View>
```

- [ ] **Step 2: Add the signature `<Image>` just before the closing `</View>`**

```tsx
      <Text style={styles.content}>
        Nota: {visita.cepilladoDiagnosis.notes}
      </Text>
      <Image src="/images/doctor_signature.png" style={styles.signature} />
    </View>
```

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: build succeeds.

- [ ] **Step 4: Visual smoke-test the Cepillado report**

Same flow as Task 2 Step 4 but for a patient with a Cepillado visit. Verify the same three conditions:
- Right-aligned signature below the Nota line, on the same page as the diagnosis tail.
- Image renders correctly (not white-boxed).
- Microscope-logo footer unchanged.

- [ ] **Step 5: Commit**

```
git add src/app/ui/pdfComponents.tsx
git commit -m "feat(pdf): add doctor signature to Cepillado report

Same pattern as the Pap report: <Image> element appended to the
document body of CepilladoDiagnosisComponent. Visual verification
passed on a real Cepillado visit."
```

---

## Task 4: Add the signature to `BiopsiaDiagnosisComponent`

**Files:** Modify: `src/app/ui/pdfComponents.tsx`

Same pattern as Tasks 2 and 3.

- [ ] **Step 1: Locate the end of the Biopsia component's body section**

Find `BiopsiaDiagnosisComponent` (starts around line 259). Inside it, the inner `<View style={styles.section}>` block ends with:

```tsx
        <Text style={styles.content}>Nota: {visita[visita.type]?.notes}</Text>
      </View>
```

(Note the deeper indentation because `BiopsiaDiagnosisComponent` wraps its `<Page>` in a function-body `return (...)` instead of an arrow-direct return — so the inner JSX is one indentation level deeper. The structural pattern is identical.)

- [ ] **Step 2: Add the signature `<Image>` just before the closing `</View>`**

```tsx
        <Text style={styles.content}>Nota: {visita[visita.type]?.notes}</Text>
        <Image src="/images/doctor_signature.png" style={styles.signature} />
      </View>
```

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: build succeeds.

- [ ] **Step 4: Visual smoke-test the Biopsia report**

Same flow as Tasks 2 and 3 Step 4 but for a patient with a Biopsia visit. Verify the three conditions identically.

Biopsia reports tend to be the longest of the three (they contain macroscopic and microscopic descriptions, both potentially long). This is the most likely report type to span multiple pages — pay attention to whether the signature lands on the last page (correct) or on a fresh page alone (would mean `marginTop` is too aggressive and pushed the signature past the last page boundary; tune it down if observed).

- [ ] **Step 5: Commit**

```
git add src/app/ui/pdfComponents.tsx
git commit -m "feat(pdf): add doctor signature to Biopsia report

Same pattern as the Pap and Cepillado reports: <Image> element
appended to the document body of BiopsiaDiagnosisComponent. Visual
verification passed on a real Biopsia visit, including multi-page
behavior (signature lands on the last page, not a fresh page)."
```

---

## Task 5: Push, open PR, verify Vercel preview

- [ ] **Step 1: Final local checks**

Run:
```
pnpm run build
pnpm audit
```
Expected: build succeeds, audit shows zero HIGH/MODERATE.

- [ ] **Step 2: Push the branch**

Run: `git push -u origin feature/pdf-signature`
Expected: push succeeds.

- [ ] **Step 3: Open the PR against `development`**

```
gh pr create --base development --title "feat(pdf): add doctor's signature to all report types" --body "$(cat <<'EOF'
## Summary

Adds Dra. Carolina Lorena Vadillo's signature image to every PDF medical report generated by the app. This is the actual client request that motivated the modernization round (deps upgrade + pnpm migration) leading up to it.

## What changed

- **New asset:** `public/images/doctor_signature.png` — transparent PNG of the doctor's signature.
- **One new style** in `pdfComponents.tsx`'s `StyleSheet.create(...)`: `signature` (width 150pt, marginTop 30pt, right-aligned).
- **One new `<Image>` element** appended to the body section of each of the three report components: `PapDiagnosisComponent`, `CepilladoDiagnosisComponent`, `BiopsiaDiagnosisComponent`.

## What did NOT change

- No data model changes — same visit / patient schemas.
- No new dependencies.
- No backend changes.
- No changes to the existing fixed microscope-logo footer.
- No conditional logic — the signature appears unconditionally on all three report types.

## How multi-page works

The signature is rendered as the last element of the document body, not as a fixed footer. React-pdf's normal flow places it on whichever page the document tail lands on — which is the last page for any-length report.

## Test plan

Visual verification on local dev for each report type:
- [x] Pap report: signature visible, right-aligned, below the Nota line, on the same page as the diagnosis tail.
- [x] Cepillado report: same.
- [x] Biopsia report: same, including multi-page handling on long diagnoses.
- [x] Microscope-logo footer unchanged on all three.

To verify on this PR:
- [ ] Vercel preview build succeeds.
- [ ] Critical path passes on the deployed preview.
- [ ] All three PDF types generated from the preview look identical to local.

## Out of scope

- Adding a backend — final sub-project.

Spec: [docs/superpowers/specs/2026-05-28-pdf-signature-design.md](docs/superpowers/specs/2026-05-28-pdf-signature-design.md)
Plan: [docs/superpowers/plans/2026-05-28-pdf-signature.md](docs/superpowers/plans/2026-05-28-pdf-signature.md)
EOF
)"
```

Expected: PR created, gh prints the URL.

- [ ] **Step 4: Watch the Vercel preview build**

Wait for the Vercel preview to deploy. Open the preview URL, walk the critical path against it. Generate one PDF of each type from the preview and confirm the signatures render identically to local.

- [ ] **Step 5: Done**

Mark the signature sub-project complete. The next (and last) sub-project is the **backend** — biggest design surface, will get its own brainstorm + spec + plan cycle.

---

## Rollback

Each Task 2/3/4 commit is independently revertable. If a per-report visual issue is found later:
- `git revert <commit-sha>` undoes just that one report's signature without affecting the other two.

If the whole approach turns out to be wrong (the signature image is unsuitable, etc.):
- `git checkout development && git branch -D feature/pdf-signature` discards the branch entirely.

## Out of scope (reaffirmed)

- Per-visit secondary-doctor signatures.
- A printed name caption under the signature.
- Conditional rendering by report type or doctor identity.
- Any change to the existing fixed microscope-logo footer.
- Any data model, schema, or backend change.