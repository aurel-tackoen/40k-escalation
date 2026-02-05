# External Integrations

**Analysis Date:** 2026-02-05

## APIs & External Services

**Authentication:**
- Auth0 - Identity and access management provider
  - SDK/Client: Auth0 OAuth 2.0 protocol (no dedicated package, implemented via H3 fetch)
  - Implementation: Server-side OAuth code exchange in `server/api/auth/callback.get.ts`
  - Auth endpoints: `/authorize`, `/oauth/token`, `/userinfo` on Auth0 domain
  - Env vars: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_CALLBACK_URL`

**Game System Data:**
- Internal API via Nitro endpoints - No external third-party game system APIs integrated
- Game systems (Warhammer 40k, AoS, MESBG) are stored in PostgreSQL and managed via admin panel

## Data Storage

**Databases:**
- Neon PostgreSQL - Primary database
  - Connection: `DATABASE_URL` (local dev) or `NETLIFY_DATABASE_URL` (production)
  - Client: `@netlify/neon` (HTTP client) + Drizzle ORM
  - Schema: `db/schema.ts` with tables for users, leagues, players, matches, armies, etc.
  - Migrations: Generated and stored in `migrations/` directory

**File Storage:**
- Local filesystem only - No external cloud storage (S3, Cloudinary, etc.)
- User avatars: Generated via `ui-avatars.com` API in `server/api/auth/callback.get.ts` (falls back if Auth0 picture unavailable)

**Caching:**
- None configured - Application uses database queries directly
- No Redis, Memcached, or other cache layer detected

## Authentication & Identity

**Auth Provider:**
- Auth0 - Custom enterprise authentication
  - Implementation: OAuth 2.0 Authorization Code flow
  - Flow:
    1. User redirected to Auth0 login page via `/api/auth/login`
    2. User authenticates with Auth0
    3. Auth0 redirects back to `/api/auth/callback` with authorization code
    4. Server exchanges code for access token and user info
    5. User record created/updated in PostgreSQL (`users` table)
    6. Session cookie set with base64-encoded session data (24-hour expiry)
  - Scopes requested: `openid profile email`
  - Custom claims: Role information via Auth0 Action (namespace: `https://40k-escalation.app`)
  - Files involved:
    - `server/api/auth/login.get.ts` - Initiates login/signup flow
    - `server/api/auth/callback.get.ts` - Handles OAuth callback
    - `server/api/auth/user.get.ts` - Returns current user
    - `server/api/auth/logout.get.ts` - Session termination
    - `server/utils/auth.ts` - Authentication middleware (`requireAuth`, `requireLeagueMembership`, etc.)

**Session Management:**
- Cookie-based sessions (`auth_session`)
- Session data: Base64-encoded JSON containing:
  - `sub` (Auth0 subject/ID)
  - `email`, `name`, `picture`
  - `role` (extracted from Auth0 custom claims)
  - `userId` (database ID)
  - `access_token` (Auth0 access token)
  - `expires_at` (token expiration timestamp)
- Security: httpOnly, secure (production), sameSite=lax

**Password Management:**
- bcryptjs 3.0.2 - Used for hashing (likely for admin password if any local auth exists)
- Auth0 handles all user password management

## Monitoring & Observability

**Error Tracking:**
- None configured - No Sentry, Rollbar, or similar error tracking service
- Console logging present but not centralized

**Logs:**
- Server-side: Console logs (stdout) - likely captured by Netlify logs
- Client-side: Browser console only
- Database: Neon query logs available via Neon console

## CI/CD & Deployment

**Hosting:**
- Netlify - Full deployment platform
  - Functions: Nitro API routes run as Netlify Functions
  - Static assets: Deployed to Netlify CDN
  - Environment variables: Configured in Netlify dashboard

**CI Pipeline:**
- None explicitly configured - Git commits to main trigger Netlify auto-deploy
- Webhooks from GitHub to Netlify for automatic deployments

**Deployment Flow:**
1. Push to main branch (or merge PR)
2. Netlify webhook triggered
3. Build: `npm run build` on Node 20.19.0
4. Output published from `dist/` directory
5. Netlify Functions initialized for API routes
6. Database migrations (manual via `db:migrate` script)

## Environment Configuration

**Required env vars:**

**Auth0:**
- `AUTH0_DOMAIN` - Tenant domain (e.g., `tenant.auth0.com`)
- `AUTH0_CLIENT_ID` - Application client ID
- `AUTH0_CLIENT_SECRET` - Application client secret
- `AUTH0_CALLBACK_URL` - OAuth redirect URI (e.g., `http://localhost:3000/api/auth/callback`)

**Database:**
- `DATABASE_URL` - PostgreSQL connection string for local development
- `NETLIFY_DATABASE_URL` - PostgreSQL connection string for production (set by Netlify integration)

**Optional:**
- `JWT_SECRET` - Referenced in `nuxt.config.ts` but not yet implemented
- `SESSION_SECRET` - Session encryption (currently uses base64 encoding, not true encryption)
- `NODE_ENV` - Set to 'production' on Netlify, 'development' locally

**Secrets location:**
- `.env` file (local development only, never committed)
- Netlify Environment Variables dashboard (production)
- Auth0 Settings > Applications > [Application] (for Auth0 credentials)

## Webhooks & Callbacks

**Incoming:**
- `/api/auth/callback` - Auth0 OAuth callback endpoint (receives authorization code)
- `/api/leagues/join-by-token/[token]` - League join endpoint with share token

**Outgoing:**
- None detected - No external webhook calls to third-party services
- Netlify automatically sends deployment notifications to configured integrations

## Integration Points with External Data

**User Avatar Generation:**
- Falls back to `https://ui-avatars.com/api/?name={encoded_name}` if Auth0 picture unavailable
- This is an optional, non-critical integration

**Database Connection:**
- Neon provides PostgreSQL over HTTPS
- @netlify/neon HTTP client handles connection pooling and failover
- No direct socket connections; HTTP-based for serverless compatibility

---

*Integration audit: 2026-02-05*
