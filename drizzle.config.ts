import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    // Use DATABASE_URL for local development, NETLIFY_DATABASE_URL for production
    url: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL!
  },
  schema: './db/schema.ts',
  /**
     * Never edit the migrations directly, only use drizzle.
     * There are scripts in the package.json "db:generate" and "db:migrate" to handle this.
     */
  out: './migrations'
});
