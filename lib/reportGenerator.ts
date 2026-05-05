'use server';

import { db } from '@/db';
import { bookings, transactions } from '@/db/schema';
import { count, sql, gte } from 'drizzle-orm';

export async function generateFakeReports() {
  try {
    // Get total bookings count
    const [totalBookings] = await db.select({ value: count() }).from(bookings);
    const totalServicesUsed = Number(totalBookings?.value || 0);

    // Get transaction counts by type for channel mix
    const [momoCount] = await db.select({ value: count() })
      .from(transactions)
      .where(sql`type = 'momo'`);

    const [withdrawCount] = await db.select({ value: count() })
      .from(transactions)
      .where(sql`type = 'withdraw'`);

    const [depositCount] = await db.select({ value: count() })
      .from(transactions)
      .where(sql`type = 'deposit'`);

    const totalTransactions = (Number(momoCount?.value || 0) + Number(withdrawCount?.value || 0) + Number(depositCount?.value || 0)) || 1;

    const atmVsBranchUsage = {
      app: Math.round((Number(momoCount?.value || 0) / totalTransactions) * 100),
      atm: Math.round((Number(withdrawCount?.value || 0) / totalTransactions) * 100),
      branch: Math.round((Number(depositCount?.value || 0) / totalTransactions) * 100),
    };

    // Get daily bookings for last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const rawDailyBookings = await db
      .select({
        date: sql<string>`date(created_at)`,
        count: count()
      })
      .from(bookings)
      .where(gte(bookings.createdAt, sevenDaysAgo))
      .groupBy(sql`date(created_at)`)
      .orderBy(sql`date(created_at)`);

    // Create array for all 7 days, filling in missing days with 0
    const dailyBookings = Array.from({ length: 7 }).map((_, i) => {
      const dayDate = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayStr = dayDate.toISOString().split('T')[0];
      const found = rawDailyBookings.find(d => d.date === dayStr);
      return {
        day: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        count: Number(found?.count || 0)
      };
    });

    return {
      totalServicesUsed,
      atmVsBranchUsage,
      dailyBookings
    };
  } catch (error) {
    console.error('Report Generation Error:', error);
    return {
      totalServicesUsed: 0,
      atmVsBranchUsage: { app: 0, atm: 0, branch: 0 },
      dailyBookings: []
    };
  }
}