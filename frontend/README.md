# DnD Settlements frontend

React, TypeScript, React Router and Vite power the campaign directory and settlement workspace.

## Development

Run these commands from the frontend directory with Node 22.22 or later and npm.

```sh
npm ci
npm run dev
```

The browser requests the same-origin `/api/` path. Vite forwards it to FastAPI at `http://127.0.0.1:8000` during local development. Set `API_PROXY_TARGET` when starting Vite to use a different backend address. Docker Compose serves the same paths through nginx.

## Where changes belong

| Location under `src/` | Responsibility |
| --- | --- |
| `App.tsx` | Routes for the campaign list, campaign details and settlement workspace |
| `api/` | FastAPI models, endpoint paths, request bodies and HTTP errors. Collection endpoints declare when a 404 represents an empty list. |
| `campaigns/` | Campaign pages, directory links and their styles |
| `settlement/` | Settlement navigation and tab composition. The assets, buildings and events directories contain their controls and cards. |
| `settlement/useSettlement.ts` | Settlement commands and the reads affected by each command |
| `settlement/settlementWrites.ts` | In-flight writes by settlement ID and coordination when reopening a settlement |
| `hooks/useQuery.ts` | Cancellable reads, explicit retries, refreshes and updates from confirmed writes |
| `components/` | Shared navigation and request status UI |

## Settlement data flow

Opening a settlement loads its identity first. The balance, campaign sidebar and active events can then load independently. Buildings and history load on first visit. Expanding an event loads its resolution choices. A failed section offers its own retry. A failed refresh keeps the last successful data visible.

| Successful command | Update in the UI |
| --- | --- |
| Donate, withdraw or collect income | Display the balance returned by the server. |
| Build a project | Replace the project with the returned building and refresh assets. |
| Decide an event | Remove the event from the active list, refresh assets and invalidate history. Visible history refreshes immediately. |
| Create a resolution | Close the draft and reload that event’s choices. |

One command per settlement can be in flight in this browser tab. Returning to that settlement waits for the pending command before loading its mutable data. After a write error the workspace rereads its visible resources and marks inactive sections for refresh when opened. The backend owns transactionality and coordination between clients.

For a new settlement action, define the request in `api/`, wire its effects in `useSettlement.ts`, and pass a callback to the control. Keep form drafts in the component. Shared asset fields drive both the resolution form and the displayed effects of projects and decisions.

## Verification

```sh
npm test
npm run lint
npm run build
```

The Node tests exercise the TypeScript API modules directly. They cover endpoint contracts, missing history entries, cancellation signal forwarding, duplicate submissions and returning to a settlement during successful and failed writes. The production build runs strict TypeScript checking.
