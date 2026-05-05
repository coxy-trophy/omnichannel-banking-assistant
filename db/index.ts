import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dns from 'dns';

// Force IPv4 for institutional network resilience
dns.setDefaultResultOrder('ipv4first');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
