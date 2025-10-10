# Nuxt v4 Project Structure

This project follows the official Nuxt v4 directory structure conventions.

## Directory Layout

```
40k-escalation/
├── app/                          # Application code (Nuxt v4 convention)
│   ├── assets/                   # Static assets (CSS, images, fonts)
│   │   └── css/
│   │       ├── base.css          # Base styles
│   │       └── main.css          # Tailwind v4 config and custom styles
│   ├── components/               # Auto-imported Vue components
│   │   ├── ArmyListsView.vue
│   │   ├── DashboardView.vue
│   │   ├── LeagueSetupView.vue
│   │   ├── MatchesView.vue
│   │   ├── PlayersView.vue
│   │   └── icons/                # Icon components
│   ├── layouts/                  # Nuxt layouts
│   │   └── default.vue           # Default layout with navigation
│   ├── pages/                    # File-based routing
│   │   ├── index.vue             # Home (redirects to dashboard)
│   │   ├── dashboard.vue         # Dashboard page
│   │   ├── players.vue           # Players management
│   │   ├── armies.vue            # Army lists
│   │   ├── matches.vue           # Match history
│   │   └── setup.vue             # League setup
│   ├── stores/                   # Pinia stores
│   │   └── league.js             # Main league store
│   └── app.vue                   # Root app component
├── public/                       # Public static files
│   ├── favicon.ico
│   └── robots.txt
├── nuxt.config.ts               # Nuxt configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # Project documentation
```

## Key Features of Nuxt v4 Structure

### 1. **app/ Directory**
All application code lives in the `app/` directory. This:
- Keeps code separate from `node_modules/` and `.git/`
- Makes file watchers faster (especially on Windows/Linux)
- Gives IDEs better context about client vs server code

### 2. **Auto-imports**
- Components in `app/components/` are auto-imported
- Composables would go in `app/composables/`
- Utilities would go in `app/utils/`

### 3. **File-based Routing**
- Pages in `app/pages/` automatically create routes
- `pages/dashboard.vue` → `/dashboard`
- No need for manual route configuration

### 4. **Layouts**
- Layouts in `app/layouts/` can be applied to pages
- `default.vue` is used automatically
- Can switch layouts per page with `<NuxtLayout name="...">`

### 5. **Store Management**
- Pinia stores in `app/stores/`
- Auto-imported via `@pinia/nuxt` module
- Use `useLeagueStore()` anywhere in the app

## Technology Stack

- **Framework**: Nuxt v4.1.2 (SPA mode)
- **UI Framework**: Vue 3.5.22
- **Styling**: Tailwind CSS v4.1.13
- **State Management**: Pinia 2.3.1
- **Build Tool**: Vite 7.1.7
- **Runtime**: Node.js 20.16.0

## Configuration

### SPA Mode
The app runs in SPA (Single Page Application) mode with `ssr: false` in `nuxt.config.ts`.

### Tailwind CSS v4
Uses the new CSS-first configuration:
- PostCSS plugin: `@tailwindcss/postcss`
- Configuration in `app/assets/css/main.css` using `@theme` directive
- Content sources defined with `@source` directives

### Pinia Store
Global state management with Pinia:
- League configuration
- Players list
- Army lists
- Match history
- All CRUD operations

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Future Enhancements

With the Nuxt v4 structure, the following can be easily added:

1. **Server API Routes** (`/server/api/`)
   - Database operations
   - Authentication
   - Multi-user support

2. **Middleware** (`app/middleware/`)
   - Route guards
   - Authentication checks

3. **Plugins** (`app/plugins/`)
   - Third-party integrations
   - Global plugins

4. **Composables** (`app/composables/`)
   - Reusable composition functions
   - Custom hooks

5. **Utils** (`app/utils/`)
   - Helper functions
   - Utilities

## References

- [Nuxt v4 Blog Post](https://nuxt.com/blog/v4)
- [Nuxt v4 Directory Structure](https://nuxt.com/docs/4.x/guide/directory-structure)
- [app.vue Documentation](https://nuxt.com/docs/4.x/guide/directory-structure/app/app)
