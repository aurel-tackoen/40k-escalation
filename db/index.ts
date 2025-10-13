import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonQueryFunction } from '@neondatabase/serverless';

import * as schema from './schema';

// Initialize Neon client (uses NETLIFY_DATABASE_URL automatically)
// Type cast needed due to incompatibility between @netlify/neon and drizzle-orm types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = neon() as unknown as NeonQueryFunction<any, any>;

// Create drizzle instance with schema
export const db = drizzle(client, { schema });
