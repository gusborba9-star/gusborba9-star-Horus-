# Architecture — Foundation

## Current target boundary

```text
Browser
  ↓
Next.js route/page
  ↓
Authentication / Authorization
  ↓
Application services
  ↓
Domain services
  ↓
Infrastructure adapters
  ↓
Supabase / external providers
```

The repository is currently in transition. Existing API routes such as `/api/chat`, `/api/horus` and `/api/horus-router` still contain provider/orchestration logic and are therefore migration targets, not architectural exemplars.

## Identity

Supabase Auth is the identity authority. Hórus maintains application authorization separately from authentication.

A server session cookie contains the Supabase access token and is HTTP-only. Middleware validates it before protected dashboard, Nexus and API routes.

## Authorization

Application authorization will resolve role, organization, plan and entitlements before user-scoped application operations. Service Role is reserved for explicit server-side privileged operations.

## Database

New schema changes use `supabase/migrations`. Legacy `db/schema.sql` and `supabase_schema.sql` remain until their consumers have been migrated and their removal is proven safe.

## Economic boundary

The next foundation layer must expose a single path for paid execution:

```text
Auth → Authorization → Entitlement → Cost Estimate → Credit Hold
→ Provider Routing → Execution → Usage → Actual Cost → Reconciliation
```

No new provider integration should bypass this boundary.
