'use server';

import { db } from '@/db';
import { users, bookings, transactions, complaints } from '@/db/schema';
import { count, eq, sql, and, gte, sum } from 'drizzle-orm';

export async function getAdminStats() {
  try {
    const [totalUsers] = await db.select({ value: count() }).from(users);
    const [pendingKyc] = await db.select({ value: count() }).from(users).where(eq(users.kycStatus, 'pending'));
    
    const todayISO = new Date();
    todayISO.setHours(0, 0, 0, 0);
    
    const [todayBookings] = await db.select({ value: count() })
      .from(bookings)
      .where(gte(bookings.createdAt, sql`${todayISO.toISOString()}::timestamp`));

    const [totalVolumeResult] = await db.select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.status, 'success'));

    const [activeAlerts] = await db.select({ value: count() })
      .from(complaints)
      .where(eq(complaints.status, 'open'));

    return {
      totalUsers: Number(totalUsers?.value || 0),
      pendingKyc: Number(pendingKyc?.value || 0),
      todayBookings: Number(todayBookings?.value || 0),
      totalVolume: Number(totalVolumeResult?.value || 0),
      activeAlerts: Number(activeAlerts?.value || 0)
    };
  } catch (error) {
    console.error('Institutional Stats Error:', error);
    return {
      totalUsers: 0,
      pendingKyc: 0,
      todayBookings: 0,
      totalVolume: 0,
      activeAlerts: 0
    };
  }
}

export async function getPendingKYC() {
  try {
    return await db.query.users.findMany({
      where: eq(users.kycStatus, 'pending'),
      orderBy: (users, { desc }) => [desc(users.createdAt)]
    });
  } catch (error) {
    return [];
  }
}

export async function getAllUsers() {
  try {
    return await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)]
    });
  } catch (error) {
    return [];
  }
}

export async function getAllBookings() {
  try {
    return await db.query.bookings.findMany({
      with: {
        user: true,
        service: true,
        branch: true
      } as any,
      orderBy: (bookings, { desc }) => [desc(bookings.timeslot)]
    });
  } catch (error) {
    return [];
  }
}

export async function updateBookingStatus(bookingId: string, status: 'upcoming' | 'checked_in' | 'completed' | 'cancelled') {
  try {
    await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, bookingId));
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update booking' };
  }
}

export async function getRecentInquiries() {
  try {
    return await db.query.complaints.findMany({
      with: {
        user: true
      },
      orderBy: (complaints, { desc }) => [desc(complaints.createdAt)],
      limit: 10
    });
  } catch (error) {
    return [];
  }
}

export async function getUserBalance(userId: string) {
  try {
    const result = await db.select({
      balance: sql<string>`
        COALESCE(SUM(CASE WHEN type IN ('deposit', 'momo') THEN amount ELSE -amount END), 0)
      `
    }).from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.status, 'success')));

    return Number(result[0]?.balance || 0);
  } catch (error) {
    console.error('Balance Calculation Error:', error);
    return 0;
  }
}
