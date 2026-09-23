# Agilify Design System

This is the enforced contract for `Agilify-Frontend`, not a suggestion — every future prompt/session building UI here should treat this as the constraint set, the same way `docs/CLOUD_DEVOPS_PLAN.md` in the repo root constrains the infra work. If a change needs to break one of these rules, update this file in the same change, don't drift silently.

## Why these specific choices

Jira = blue. ClickUp = purple/pink. Linear = near-monochrome + violet. Every generic AI-generated SaaS template defaults to indigo/violet on slate. To not look like any of those, or like a template: **near-black zinc + one sharp signal-lime accent**, used sparingly. Nobody in this space owns lime.

## Stack (do not deviate without a real reason)

- **Vite + React 19** — not Next.js. This app is 100% behind Keycloak auth and heavy on client interactivity (drag-and-drop board, live WebSocket doc editing); React Server Components buy nothing here.
- **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first config via `@theme inline` in `src/index.css` — no `tailwind.config.js`).
- **shadcn/ui**, `new-york` style, installed via `npx shadcn@latest add <component>`. Never hand-write a primitive shadcn already has.
- Utility imports: `import { cn } from 'cn'` (the standalone npm package shadcn's current CLI generates against) — not a local `@/lib/utils`. Keep it one canonical way everywhere.
- Icons: `lucide-react` only.
- Data fetching/caching: `@tanstack/react-query`. Every API call goes through a hook in `src/hooks/`, never a raw `api.get(...)` inside a component.
- Feedback: `sonner` (`toast.error(...)` / `toast.success(...)`) for anything async that can fail — not a custom banner per feature.
- Drag-and-drop: `@dnd-kit/*`. Not `react-beautiful-dnd` (unmaintained).
- Auth: Keycloak (`keycloak-js`) only. **No local login/register page, ever** — `main.jsx` gates the whole app with `onLoad: 'login-required'` before React even renders.

## Color tokens (`src/index.css`)

Dark-only, no light theme, no toggle — don't add one unless asked.

| Token | Value | Use |
|---|---|---|
| `--background` | `#09090b` (zinc-950) | page background |
| `--card` | `#131316` | cards, popovers, dialogs |
| `--foreground` | `#fafafa` | primary text |
| `--muted-foreground` | `#a1a1aa` | secondary text |
| `--primary` | `#c6ff3d` (signal lime) | **the one accent** — primary CTAs, active nav state, the one thing your eye should land on per screen |
| `--secondary` / `--accent` | zinc-800-ish | hover surfaces, secondary buttons — never the brand color |
| `--destructive` | `#ef4444` | delete/error only |
| `--border` | `#27272a` | all dividers — **never a drop shadow to separate sections**, a 1px border only |

Rule: **one lime element per view, maybe two.** If everything is lime, nothing is. Status/priority colors (amber for in-review, emerald for done, red for P1) are semantic, not brand — they don't compete with the accent because they only ever appear as small pills/icons, never as a large filled surface.

## Typography

- Body: **Inter** (`--font-sans`).
- Headings (`h1`–`h4`) and anything in `.font-display`: **Space Grotesk** (`--font-display`) — the distinctive display face, geometric contrast against Inter's body text.
- Headings are always `font-semibold tracking-tight` — never plain-weight, never loose letter-spacing.

## Spacing & radius

- Buttons, inputs, badges: `rounded-md`.
- Cards, dialogs, modals: `rounded-xl`.
- Inside a component: tight (`gap-2`/`gap-3`, `p-3` on a card list item).
- Between sections on a page: generous (`gap-8`, page padding `p-8`).
- This contrast is deliberate — it's what makes a layout feel "designed" instead of uniformly padded like a template.

## Borders over shadows

Every `Card` in this app is `border border-border`, not `shadow-lg`. Shadows imply a light source and floating layers — the brutalist/dev-tool aesthetic here uses flat surfaces separated by a hairline border instead. Don't add `shadow-*` utilities to cards/panels; the one exception is a genuine overlay (`Dialog`, `DropdownMenuContent`) where shadcn's own subtle `shadow-md` on the popover surface is fine — that's a floating layer, so a shadow is correct there.

## Component conventions

- Don't write raw `<button>`/`<input>`/`<div role="dialog">` etc. if a shadcn primitive exists (`Button`, `Input`, `Dialog`, `DropdownMenu`, `Card`, `Badge`, `Avatar`, `Tabs`, `Select`, `Tooltip`, `ScrollArea`, `Skeleton`). Add missing ones with `npx shadcn@latest add <name>` before hand-rolling.
- Status pills and priority badges are shared components (`src/components/issue/StatusPill.jsx`, `PriorityBadge.jsx`) — reused everywhere an issue is rendered (dashboard, board, later: backlog, issue detail). Don't inline a second copy of this logic.
- Loading state: `Skeleton`, sized to roughly match the real content's shape — never a bare spinner in the middle of the page.
- Empty state: a bordered, dashed `Card` with an icon in a muted circle, a one-line heading, one line of muted body text. See `ProjectsPage`'s `EmptyState` / `BoardPage`'s "no active sprint" card for the pattern.

## Layout

- `AppShell` (`src/components/layout/AppShell.jsx`): fixed-width sidebar (`w-56`) + header (`h-14`) + scrollable `<main>`. This is the shell for every `/projects/:key/*` route.
- `ProjectsPage` is the one screen outside the shell (no project context yet) — it gets its own minimal header, reusing `UserMenu` so the account dropdown isn't duplicated.
- Sidebar nav items not yet built (Backlog, Sprints, Docs) are rendered disabled/greyed rather than omitted, so the information architecture is visible even before those screens exist. Wire them up as they're built — don't leave the illusion up if a screen ends up cut, remove the nav item instead.
