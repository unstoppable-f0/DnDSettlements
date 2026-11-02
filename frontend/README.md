# DnD Settlements frontend

React + TypeScript + Vite client. Routes and the existing Russian interface are preserved by the architecture refactor.

## Development

Use Node 22.15+ (or a newer version supported by the installed Vite release) and npm.

```sh
npm ci
npm run dev
npm run build
npm run lint
npm test
```

The client uses same-origin `/api` URLs. The repository's nginx/Docker configuration routes these to FastAPI. A standalone Vite server needs an equivalent API proxy; this refactor does not change deployment configuration.

## Responsibilities

- `api/client.ts`: the only `fetch` boundary; HTTP status handling, list-shape validation, and error formatting. It accepts abort signals. Only documented collection endpoints opt into interpreting 404 as an empty list; network errors and other failures remain errors.
- `api/campaigns.ts`: campaign and campaign-settlement queries.
- `api/settlements.ts`: settlement queries and mutations, request payloads, query parameters, and settlement snapshot assembly. Independent reads run concurrently; chosen resolutions are fetched after resolved events and joined by event ID.
- `types/`: shared API models. `Settlement.campaign` is a numeric foreign key, matching FastAPI. Types describe the contract; they do not provide runtime validation of every response field.
- `hooks/useQuery.ts`: loading/error/data state, cancellation, latest-request protection, retries, and refreshes that retain the last successful data. Pass a stable loader. Route detail components are keyed by route ID so local state resets on navigation.
- `hooks/useMutation.ts`: pending/error state and a synchronous guard against overlapping submissions. It intentionally does not retry writes.
- `pages/`: route parameters, page composition, tabs, and refresh coordination.
- `components/`: cards, panels, request status, and forms. `CreateResolutionForm` owns only its draft and submission callback; `EventResolutions` coordinates resolution queries and commands. Coffers controls retain their small local validation/operation state.

Dependency direction: pages/components → hooks/API → shared types. Endpoint strings, HTTP methods, and serialization belong in `api/`, not in JSX. No state-management or data-fetching dependency was added.

## Refresh policy and errors

After a settlement mutation, reload the complete settlement snapshot. This keeps assets, buildings, active events, and history consistent with one another and makes invalidation easy to understand. The tradeoff is extra reads compared with targeted invalidation. Consider a query cache if the number of resources or screens grows substantially.

A refresh error retains the previous snapshot and offers a retry. An initial failure shows an error rather than an endless spinner or a misleading empty list. Successful build/decision actions remain locally marked complete even if the subsequent refresh fails, avoiding an accidental repeat. Missing chosen resolutions are shown explicitly in history instead of silently hiding events.

The snapshot is assembled client-side from multiple requests; it is not a database transaction. The backend remains responsible for transactional writes and idempotency. Cancelling a read prevents an obsolete response from updating the UI; it does not undo a server mutation.

## Extending the application

1. Add or update the shared type to match the backend contract.
2. Add the endpoint function to the appropriate API module; decide explicitly whether 404 means an empty collection.
3. Supply a stable loader to `useQuery`, and render `QueryStatus` plus successful and empty states.
4. Keep form drafts local. Route mutations through the API and refresh their owning page after success.
5. Add contract/regression tests for changed request or assembly behavior, then run build, lint, and tests.

## Verification

`tests/api.test.mjs` covers HTTP errors, intentional empty collections, malformed lists, network failures, history joins, abort-signal forwarding, empty-history request avoidance, and mutation methods/payloads. The small Node loader uses the existing TypeScript compiler; no additional test dependency is installed. Type checking is enforced separately by the production build with `strict: true`.

The tests mock fetch and do not establish browser interaction behavior or live-backend compatibility. Browser navigation, pending states, retries, and end-to-end mutations should also be checked against a development database before release.
