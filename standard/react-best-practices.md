# React Development Best Practices — JARVIS Traceability Demo

> **Purpose:** A **demo-ready**, agent-consumable coding standard for the JARVIS Process Result Traceability prototype **frontend** — the minimal *Site Admin Console* (create/view the BUC-0 process model) and the results/traceability views that complement the Grafana dashboard.
> **Scope:** React (with TypeScript) SPA talking to the .NET 8 BUC-2 API. Kept intentionally lean so a BMAD Dev agent (Amelia) can apply it during a live build.
> **How to use in BMAD:** place in `docs/org/` (or `devLoadAlwaysFiles`) so it loads as standing context for every frontend story.

---

## 0. Demo Guardrails (read first)

| Priority | Practice | Why it matters for the demo |
|---|---|---|
| ✅ Must | TypeScript + strict mode | Type-safe payloads matching the API contract |
| ✅ Must | One data-fetching layer (typed API client) | Single source of truth for BUC-2 calls |
| ✅ Must | Loading / error / empty states on every view | Live demo never shows a blank/broken screen |
| ✅ Must | Form validation before submit | Mirrors backend "non-anonymous + validated" rule |
| ✅ Must | Component + a11y basics (labels, roles) | Clean, credible UI on screen share |
| 🔶 Nice | React Query for server state | Caching, retries, less boilerplate |
| 🔶 Nice | Storybook for the model-editor component | Nice-to-have, skip if time-boxed |

---

## 1. Project Setup & Conventions

### 1.1 Stack
- **Vite + React 18 + TypeScript** (fast dev server, instant HMR — ideal for live demos).
- Package manager: `npm` (or `pnpm`). Node 20 LTS.
- Suggested structure (feature-first, not type-first):
  ```
  src/
    api/            → typed API client + DTOs (mirror the .NET records)
    features/
      process-model/  → BUC-0: create/view flow, steps, operations, results
      results/        → BUC-1/2: recorded results table + detail
    components/     → shared, presentational UI
    hooks/          → reusable logic (useProcessModel, useRecording)
    lib/            → config, formatting, constants
    App.tsx
  ```

### 1.2 Strictness (biggest quality win)
`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "jsx": "react-jsx"
  }
}
```
- Add **ESLint** (`eslint-plugin-react`, `react-hooks`, `@typescript-eslint`) + **Prettier**. Run on build; treat errors as blocking.

### 1.3 Naming
- Components **PascalCase** (`ProcessModelEditor`), hooks `useCamelCase` (`useRecording`), files match the component name.
- DTO types mirror the backend records exactly (`ProcessResultPayload`, `RecordResult`) so the contract is obvious.

---

## 2. Component Guidelines

### 2.1 Structure
- **Function components + hooks only.** No class components.
- Keep components small and single-purpose. Split "smart" (data/state) from "presentational" (props-in, UI-out).
- Co-locate a component with its styles and test: `ProcessModelEditor.tsx`, `.module.css`, `.test.tsx`.

### 2.2 Props & types
- Type every prop; no `any`. Prefer explicit union types for the VIB domain (e.g. `type StationMode = 'Serial' | 'Prototype' | 'Retest' | 'Rework' | 'MasterSample' | 'StepByStep'`).
- Use `readonly` props and avoid mutating props/state directly.

### 2.3 Composition over configuration
- Build the process-model editor from small pieces (`FlowList`, `StepRow`, `OperationRow`, `ResultField`) rather than one giant form — easier to demo and to change live.

---

## 3. State Management

- **Local state** (`useState`/`useReducer`) for UI; don't reach for a global store you don't need in a demo.
- **Server state** → a typed API layer; use **React Query (TanStack Query)** if you want caching/retries for free. Keep server data out of Redux.
- Derive, don't duplicate: compute values with `useMemo` instead of storing copies in state.
- Lift state only as high as needed; pass callbacks down, data up.

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['process-model', partNumber],
  queryFn: () => api.getProcessModel(partNumber),
});
```

---

## 4. Data Fetching & API Contract

The frontend must exactly honor the BUC-2 API contract — this is what Valeo tests against.

- **One typed client** in `src/api/`; no `fetch` scattered across components.
- Always model the three backend outcomes from the VIB: **success / degraded / rejected** — and surface them clearly in the UI.
```tsx
async function recordResult(payload: ProcessResultPayload): Promise<RecordResult> {
  const res = await fetch(`${API_BASE}/api/v1/process-results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<RecordResult>;
}
```
- Send the **auth header** on every call (mirrors the "non-anonymous" VIB rule).
- Handle **loading / error / empty** on every screen — a demo must never freeze on a blank panel.
- Show **degraded-mode** records with a visible badge so reviewers can see "recorded, but incomplete" — a great live talking point.

---

## 5. Performance (keep the demo snappy)

- **Memoize** expensive renders: `React.memo`, `useMemo`, `useCallback` on the results table and model tree.
- **Virtualize** long result lists (`react-window`) — the VIB sample has large result arrays.
- **Stable keys** (use the serial number / result id, never array index) to avoid re-render bugs.
- **Code-split** heavy views with `React.lazy` + `Suspense`.
- Avoid unnecessary re-renders: don't create new object/array literals inline in props on the hot path.

---

## 6. Forms & Validation

The process-model editor (BUC-0) and any manual operator input must validate before hitting the API.

- Use a schema validator (**Zod**) shared with the API DTO types for one source of truth.
- Validate required VIB fields (Part Number, ordered steps, result type/UOM/spec levels) client-side; show inline errors.
- Disable submit while pending; prevent double-submit (protects the recording path).

```tsx
const ResultSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['Numeric', 'Text', 'File']),
  uom: z.string().optional(),
  lsl: z.number().optional(),
  usl: z.number().optional(),
  mandatory: z.boolean(),
});
```

---

## 7. Accessibility & UX (credibility on screen share)

- Every input has a `<label>`; interactive elements are keyboard-reachable.
- Use semantic HTML (`<table>`, `<button>`, `<nav>`) and ARIA roles where needed.
- Sufficient color contrast; don't rely on color alone for PASS/NOK/SCRAP — add text/icon.
- Consistent spacing and a small design system (a component lib like MUI is fine for a demo).

---

## 8. Testing

- **Unit/component:** Vitest + React Testing Library. Test behavior, not implementation.
- Cover the three demo-critical flows:
  1. Model editor creates a valid BUC-0 flow.
  2. Recording form surfaces a **degraded** result badge correctly.
  3. API/auth error shows a friendly error state (no blank screen).
```tsx
test('shows degraded badge when API returns degraded status', async () => {
  render(<ResultsTable rows={[degradedRow]} />);
  expect(screen.getByText(/degraded/i)).toBeInTheDocument();
});
```
- Optional: one **Playwright** happy-path E2E (create model → record via API → see it in the table) as a live-demo safety net.

---

## 9. Security & Config

- **No secrets in the bundle.** API base URL / key via `import.meta.env` (Vite env vars), injected at build/runtime.
- Sanitize/escape any user-rendered strings (React escapes by default — don't use `dangerouslySetInnerHTML`).
- Lock CORS to the demo origin on the API side; use HTTPS.
- Pin dependency versions; run `npm audit` before the demo.

---

## 10. AI-Assisted Development (log it for the challenge)

- Use Copilot/IntelliCode to scaffold components, hooks, and tests — then **capture prompts + your corrections** for the AI Engineering Log.
- AI-generated UI must still pass ESLint, TypeScript strict, and the tests above before commit.

---

## 11. Definition of Done (demo checklist)

- [ ] TypeScript strict; ESLint/Prettier clean.
- [ ] All API calls go through the typed client with auth header.
- [ ] Every view handles loading / error / empty; degraded records visibly badged.
- [ ] Forms validate required VIB fields before submit; no double-submit.
- [ ] Component tests cover model-create, degraded badge, and error state.
- [ ] No secrets in the bundle; `npm audit` clean.
- [ ] AI usage (prompts + corrections) captured for the Engineering Log.

---

*Companion to `dotnet-best-practices.md` and `data-best-practices.md` — a demo-ready, agent-loadable frontend standard for the JARVIS BMAD build.*
