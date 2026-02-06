# Project Instructions

## Git Workflow

- **NEVER commit directly to main.** Always create a feature branch for each milestone/phase.
- Branch naming: `milestone/<version>` (e.g., `milestone/v0.2`) or `feature/<description>` for smaller work.
- All commits happen on the feature branch. Main is only updated via merge at the end.

## Deployment Strategy

- **Keep all work local until the final phase of a milestone.** Do not push to remote during development phases.
- The last phase of every milestone must handle: pushing the branch, creating a PR, merging to main, and deploying to production.
- This protects production from in-progress changes like database migrations, breaking API changes, etc.
- Migrations and schema changes must be fully tested locally before any push to remote.
