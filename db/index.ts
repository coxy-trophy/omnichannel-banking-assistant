import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import dns from 'dns';

// Force IPv4 for institutional network resilience
dns.setDefaultResultOrder('ipv4first');

const url = process.env.DATABASE_URL || "postgresql://neondb_owner:password@ep-placeholder.us-west-2.aws.neon.tech/neondb?sslmode=require";

const sql = neon(url);
export const db = drizzle(sql, { schema });
