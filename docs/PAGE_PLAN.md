# Agilify Frontend — Full Page Plan

Every page here maps to a real, already-built backend endpoint — nothing invented that the API can't back. No channels/chat, no presence, no JQL search UI, no time-tracking: those don't exist server-side, so they're not on this list.

## Page inventory (10 screens total)

| # | Route | Status | Backend it uses |
|---|---|---|---|
| 1 | `/projects` | ✅ built | `GET/POST /projects` |
| 2 | `/projects/:key/dashboard` | ✅ built | `GET /issues`, `GET /board` |
| 3 | `/projects/:key/board` | ✅ built | `GET /board`, `PATCH /issues/{id}/position` |
| 4 | `/projects/:key/backlog` | next | `GET /backlog`, `POST /issues`, `PATCH /issues/{id}/sprint` |
| 5 | `/projects/:key/sprints` | next | `GET/POST /sprints`, `PATCH .../status`, `POST .../complete` |
| 6 | `/projects/:key/issues/:issueId` | next | `GET /issues/{id}`, `PUT`, `PATCH .../status`, `/assignee`, comments, history, labels, watchers |
| 7 | `/projects/:key/docs` | after CRDT UI | `GET/POST /projects/{key}/docs` |
| 8 | `/projects/:key/docs/:docId` | after CRDT UI | `/ws/docs/{docId}` (Yjs live editor) |
| 9 | `/projects/:key/settings/members` | later | `POST/DELETE /projects/{key}/members` |
| — | Notification bell (header, not a route) | later | `GET/POST /notifications` |

Sidebar already shows all of these; the not-yet-built ones render disabled until wired up, so the nav never lies about what exists (`Sidebar.jsx`'s `disabled` flag).

## How each one works

**Backlog** — flat list of unsprinted issues (`sprintId == null`), each row: type icon, key, title, priority badge, an assignee avatar, and a sprint-picker dropdown that fires `PATCH /issues/{id}/sprint`. A "New issue" button opens the same create form pattern as the Projects page's dialog. This is also where an issue is born before ever touching a sprint.

**Sprints** — list of the project's sprints (`PLANNED`/`ACTIVE`/`CLOSED` as a status pill), a "New sprint" dialog (name/goal/dates), and per-sprint actions gated by state: a `PLANNED` sprint can Start (`PATCH .../status {ACTIVE}`) — blocked with a toast if another sprint is already active, since the backend enforces one active sprint per project; an `ACTIVE` sprint can Complete, which opens a small dialog to optionally pick a rollover sprint for unfinished issues (`POST .../complete`), matching the real rollover-or-backlog behavior in `SprintService`.

**Issue detail** — the one screen that ties everything on an issue together, so it earns being a full page rather than a dialog:
- Left column: title/description (inline-editable, `PUT`), type/priority/status/assignee/story points/due date as a stack of small editable fields — status changes go through the same workflow-guard-aware pattern as the board, so an illegal transition surfaces the same toast.
- Labels row: attach/detach via the existing `labels` endpoints, reusing a `LabelPicker` built once and reused wherever labels show up.
- Comments thread below: nested replies via `parentCommentId`, edit/delete gated client-side by `isAuthorOrAdmin` semantics mirrored from the backend (own comment, or you're an ADMIN).
- Right rail: history timeline (`GET .../history`, already-built endpoint, currently unused by any page) and a watch/unwatch toggle (`POST/DELETE .../watchers`).

**Docs list + Doc editor** — list is the same card-grid pattern as Projects. The editor is the CRDT piece: on mount, connect `keycloak.token` + `docId` to `/ws/docs/{docId}`, feed incoming binary frames into a `Y.Doc` via `Y.applyUpdate`, bind a `Y.Text` to a rich-text surface (plain `contentEditable` + Yjs's own binding is enough to start; upgrading to a full editor like Tiptap is a later, separate decision, not required to prove the CRDT loop works), and forward local edits back over the socket as binary `Y.Doc` updates. This is a genuinely separate, self-contained piece of work from the pages above — I'd rather build and test it on its own once the simpler CRUD pages are done, than rush it in alongside them.

**Settings → Members** — ADMIN-only (route itself checks the caller's role via the same project data already fetched for the header), a simple table of members with role badges, an "Add member" dialog, and a remove action that surfaces the backend's real "can't remove the sole ADMIN" 409 as a toast instead of pretending it succeeded.

**Notification bell** — not a route, a header icon with an unread-count badge and a dropdown list (`GET /notifications?unreadOnly=true`), each item marking itself read on click (`POST /notifications/{id}/read`) and linking to the referenced issue.

## Build order from here

I'm building 4, 5, and 6 next (Backlog, Sprints, Issue Detail) — they all reuse hooks and components that already exist (`useProjectIssues`, `StatusPill`, `PriorityBadge`, the dialog pattern from `ProjectsPage`), so they're incremental, not a new subsystem. Docs (7, 8) and Settings (9) come after, since the doc editor is a distinct real-time subsystem worth its own focused pass, and Settings is the lowest-value screen of the remaining set.
