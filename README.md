# Agilify Frontend

Web client for **Agilify**, a Jira-style agile project management system with live collaborative documents and AI duplicate detection. The backend (API, Keycloak setup, full feature list and the AWS CI/CD pipeline) is documented in [Agilify-Backend](https://github.com/im-rk/Agilify-Backend).

## Pages

| Page | What it does |
|---|---|
| Projects | List and create projects |
| Dashboard | Issue counts, status breakdown, active sprint |
| Backlog | Issues not in a sprint, create issues (with the AI duplicate warning), move to a sprint |
| Board | Kanban board of the active sprint, drag and drop to change status |
| Sprints | Create, start, complete (with rollover) and delete sprints |
| Issue detail | Edit fields, assignee, labels, watchers, threaded comments, history |
| Docs and editor | Live collaborative documents (Yjs over WebSocket) |
| Members | Add members and see their roles |

There is no login page: sign-in is handled by Keycloak (OIDC with PKCE). Roles (Admin, Developer, Viewer) are per project and enforced by the backend.

## Stack

React 19, Vite, Tailwind CSS 4, shadcn/ui, TanStack Query, dnd-kit, Yjs, keycloak-js, Axios.

## Run locally

Start the backend and Keycloak first (see the backend README), then:

```bash
npm install
npm run dev        # http://localhost:5173, must be exactly this port
```

Port 5173 is required because it is the redirect URI configured on the Keycloak client.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8082/api/v1` | REST API |
| `VITE_WS_BASE_URL` | `ws://localhost:8082` | Document WebSocket |
| `VITE_KEYCLOAK_URL` | `http://localhost:8180` | Keycloak |
| `VITE_KEYCLOAK_REALM` | `agilify` | Realm |
| `VITE_KEYCLOAK_CLIENT_ID` | `agilify-app` | Client |

Scripts: `npm run build`, `npm run lint`.

## Deployment

A push to `main` runs `.github/workflows/deploy.yml`: lint, build with the production URLs, upload to S3, then the server pulls the new files and serves them. AWS access uses GitHub OIDC, with no stored keys. Details are in the backend README under "DevOps".

Design notes: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), [docs/PAGE_PLAN.md](docs/PAGE_PLAN.md).
