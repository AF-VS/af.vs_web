import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;
let cached: Db | null = null;

export function getDb(): Db {
  if (cached) return cached;
  const url = import.meta.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured');
  const turso = createClient({ url, authToken: import.meta.env.TURSO_AUTH_TOKEN });
  cached = drizzle(turso, { schema });
  return cached;
}
