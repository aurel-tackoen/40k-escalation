# Warhammer 40K Escalation League Manager

A comprehensive web application for managing Warhammer 40K escalation league campaigns. Built with Nuxt v4, Vue 3, and Tailwind CSS v4.

## 🎮 Features

- **League Management**: Configure multi-round escalation campaigns with point limits
- **Player Tracking**: Add players, track wins/losses, and maintain standings
- **Army Lists**: Build and manage army lists with unit tracking and point validation
- **Match Recording**: Record battle results with points and outcomes
- **Dashboard**: View league standings, statistics, and current round information
- **Army Escalation**: Copy armies between rounds and escalate existing lists

## 🛠️ Technology Stack

- **Nuxt v4.1.2** - Full-stack Vue framework with SPA mode
- **Vue 3.5.22** - Progressive JavaScript framework
- **Tailwind CSS v4.1.13** - Utility-first CSS framework
- **Pinia 2.3.1** - State management
- **Vite 7.1.7** - Build tool

## 📁 Project Structure

This project follows the official Nuxt v4 directory structure with all application code in the `app/` directory:

```
app/
├── assets/          # CSS and static assets
├── components/      # Auto-imported Vue components
├── layouts/         # Nuxt layouts
├── pages/           # File-based routing
├── stores/          # Pinia stores
└── app.vue         # Root component
```

See [STRUCTURE.md](./STRUCTURE.md) for detailed structure documentation.

## Setup

Make sure to install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

The app runs in SPA mode (no server-side rendering).

## Production

Build the application for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 🎯 Usage Guide

### Managing Players
1. Navigate to the **Players** tab
2. Add players with name, faction, and email
3. View player statistics and standings

### Creating Army Lists
1. Go to the **Army Lists** tab
2. Select a player and round
3. Add units with names, roles, and point costs
4. Save the army list (validates against round point limit)

### Recording Matches
1. Visit the **Matches** tab
2. Select two players and the round
3. Enter battle points for each player
4. Save the match (automatically updates player stats)

### League Configuration
1. Access the **League Setup** tab
2. Configure league name, description, and dates
3. Define rounds with point limits and date ranges
4. Set the current active round

## 🚀 Future Enhancements

- **Database Backend**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based user authentication
- **Multi-user Support**: Multiple leagues and user permissions
- **API Routes**: RESTful API in `server/api/`
- **Real-time Updates**: WebSocket support for live standings

## 📚 Documentation

- [Nuxt v4 Documentation](https://nuxt.com/docs/4.x)
- [Project Structure Details](./STRUCTURE.md)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## 📝 License

MIT
