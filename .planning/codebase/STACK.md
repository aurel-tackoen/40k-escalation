# Technology Stack

**Analysis Date:** 2026-02-05

## Languages

**Primary:**
- TypeScript 5.x - Frontend components, API routes, database utilities
- Vue 3 - UI framework for Single Page Application (SPA)
- PostgreSQL - Database DDL and queries

**Secondary:**
- JavaScript - Transpiled output from TypeScript

## Runtime

**Environment:**
- Node.js 20.19.0 (specified in netlify.toml)

**Package Manager:**
- npm - Manages dependencies
- Lockfile: `package-lock.json` (present, committed)

## Frameworks

**Core:**
- Nuxt 4.1.2 - Full-stack Vue framework (SSR disabled, client-side only)
- Vue 3.5.22 - Reactive component framework
- Vue Router 4.5.1 - Client-side routing
- Pinia 2.3.1 - State management (with @pinia/nuxt integration)

**Backend/API:**
- Nitro - Server framework (bundled with Nuxt, preset: 'netlify')
- H3 - HTTP handler library (via Nitro)

**Database:**
- Drizzle ORM 0.44.6 - Type-safe SQL query builder
- Drizzle Kit 0.31.5 - Schema migrations and studio
- PostgreSQL (via Neon) - Database provider

**Testing:**
- Vitest 3.2.4 - Unit/component test runner
- @vue/test-utils 2.4.6 - Vue component testing
- @nuxt/test-utils 3.19.2 - Nuxt composables/server testing
- Playwright 1.56.0 - End-to-end browser testing
- @vitest/ui 3.2.4 - Test dashboard
- happy-dom 18.0.0 - DOM implementation for tests

**Build/Dev:**
- Tailwind CSS 4.1.13 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.14 - PostCSS plugin for Tailwind
- PostCSS + Autoprefixer - CSS processing
- Eslint 9.37.0 - Linting
- @nuxt/eslint 1.9.0 - Nuxt-aware linting
- eslint-plugin-vue 10.5.0 - Vue linting rules

## Key Dependencies

**Critical:**
- @netlify/neon 0.1.0 - Neon database client for Netlify Functions
- @neondatabase/serverless 1.0.2 - Serverless PostgreSQL driver
- drizzle-orm/neon-http - Drizzle adapter for Neon HTTP client
- bcryptjs 3.0.2 - Password hashing for user authentication
- isomorphic-dompurify 2.29.0 - XSS prevention via HTML sanitization
- lucide-vue-next 0.545.0 - Icon library (SVG icons)
- marked 16.4.1 - Markdown parsing
- ws 8.18.3 - WebSocket support (dev dependency, likely for Netlify local dev)

**Infrastructure:**
- netlify-cli 23.9.1 - Netlify deployment and local dev server
- tsx 4.20.6 - TypeScript execution

## Configuration

**Environment:**
- `.env` - Local development secrets (DATABASE_URL, AUTH0_* vars)
- `.env.example` - Template with required variables
- Runtime config via `nuxt.config.ts` - Defines public/private keys

**Key configs required:**
- `DATABASE_URL` - PostgreSQL connection string (dev) or `NETLIFY_DATABASE_URL` (prod)
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_CLIENT_ID` - Auth0 application ID
- `AUTH0_CLIENT_SECRET` - Auth0 application secret
- `AUTH0_CALLBACK_URL` - OAuth redirect URI
- `JWT_SECRET` - (referenced but implementation not yet complete)
- `SESSION_SECRET` - Session encryption key

**Build:**
- `tsconfig.json` - TypeScript configuration
- `nuxt.config.ts` - Nuxt framework configuration
- `drizzle.config.ts` - Database schema and migration settings
- `vitest.config.ts` - Test runner configuration
- `playwright.config.ts` - E2E test configuration
- `eslint.config.ts` - Linting rules
- `netlify.toml` - Netlify deployment configuration

## Platform Requirements

**Development:**
- Node.js 20.x
- npm 10+ (or yarn/pnpm)
- PostgreSQL 14+ (or Neon branch)
- Auth0 account with configured application

**Production:**
- Netlify - Deployment target and hosting platform
- Netlify Functions - Runs Nitro API routes
- Neon PostgreSQL - Database (Netlify-integrated)
- Auth0 - OAuth/identity provider

## Deployment Configuration

**Netlify Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `.netlify/functions-internal`
- Node version: 20.19.0 (explicit)
- AI Gateway: disabled
- Custom redirects: disabled (routing handled by Nuxt/Nitro)

---

*Stack analysis: 2026-02-05*
