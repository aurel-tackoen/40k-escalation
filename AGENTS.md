# Warhammer 40k Escalation League Manager

This is a Vue.js application for managing Warhammer 40k escalation leagues with Tailwind CSS styling.

For all .vue files, keep the order of sections as:
1. `<script setup>`
2. `<template>`
3. `<style>`
4. `<style scoped>`

For all .vue files, use composition API with `<script setup>` syntax.

- Ensure Documentation is Complete - Updated AGENTS.md with comprehensive documentation
- Ensure Documentation is Complete - Updated README.md with comprehensive documentation

## Project Details
- **Type**: Vue.js web application (Nuxt 3)
- **Styling**: Tailwind CSS with Warhammer 40k theme
- **Purpose**: Manage Warhammer 40k escalation leagues
- **Features**: Player registration, match tracking, standings, progressive army building
- **Architecture**: Complete composable-based architecture with 11 reusable composables
- **Status**: ✅ COMPLETE - Production-ready with zero lint errors

## Components
- App.vue - Main application shell with navigation
- DashboardView.vue - League overview and standings with army status
- PlayersView.vue - Player registration and management with form validation & export
- ArmyListsView.vue - Complete army list builder with advanced filtering & export
- MatchesView.vue - Match recording with quality indicators, win streaks & export
- LeagueSetupView.vue - League configuration and rules
- PaintingProgress.vue - Painting progress tracking with calculations

## Latest Updates (Composables Integration)
- ✅ **Complete Composable Architecture** - All 11 composables created
- ✅ **ArmyListsView Enhanced** - useArrayFiltering + useDataExport integrated
- ✅ **PlayersView Enhanced** - useFormManagement + useDataExport integrated
- ✅ **MatchesView Enhanced** - useMatchResults + useDataExport integrated
- ✅ **Export Functionality** - CSV exports for armies, players, and matches
- ✅ **Match Analysis** - Close game detection, decisive victories, win streaks
- ✅ **Form Validation** - Professional form handling with validation framework
- ✅ **Code Quality** - ~40 lines of duplicate code eliminated, zero lint errors

## Documentation
- `/guide/COMPOSABLE_QUICK_REFERENCE.md` - Quick lookup guide (11/11 composables)
- `/guide/COMPOSABLES_HIGH_PRIORITY.md` - High priority composables (4 composables)
- `/guide/COMPOSABLES_MEDIUM_PRIORITY.md` - Medium priority composables (3 composables)
- `/guide/COMPOSABLES_LOW_PRIORITY.md` - Low priority composables (4 composables)
- `/guide/COMPOSABLES_INTEGRATION_COMPLETE.md` - Complete integration summary