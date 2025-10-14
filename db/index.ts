import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonQueryFunction } from '@neondatabase/serverless';

import * as schema from './schema';

// Initialize Neon client
// In local dev: uses DATABASE_URL from .env
// In production: uses NETLIFY_DATABASE_URL (automatically set by Netlify)
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Database URL not found. Set DATABASE_URL in .env or NETLIFY_DATABASE_URL in production.');
}

// Type cast needed due to incompatibility between @netlify/neon and drizzle-orm types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = neon(databaseUrl) as unknown as NeonQueryFunction<any, any>;

// Create drizzle instance with schema
export const db = drizzle(client, { schema });
