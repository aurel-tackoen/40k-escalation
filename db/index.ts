import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Type mismatch between @netlify/neon and drizzle-orm versions (works at runtime)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const db = drizzle({
  schema,
  client: neon() // Uses NETLIFY_DATABASE_URL automatically
});
