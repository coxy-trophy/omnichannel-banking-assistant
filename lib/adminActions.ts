'use server';

import { db } from '@/db';
import { users, bookings, transactions, complaints, kycDocuments, messages } from '@/db/schema';
import { count, eq, sql, and, gte, sum, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function getAdminStats() {
  try {
    const [totalUsers] = await db.select({ value: count() }).from(users);
    const [pendingKyc] = await db.select({ value: count() }).from(users).where(eq(users.kycStatus, 'pending'));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayBookings] = await db.select({ value: count() })
      .from(bookings)
      .where(gte(bookings.createdAt, todayStart));

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
    const pendingUsers = await db.query.users.findMany({
      where: eq(users.kycStatus, 'pending'),
      orderBy: [desc(users.createdAt)],
    });

    // Fetch documents for each user
    const usersWithDocs = await Promise.all(pendingUsers.map(async (user) => {
      const docs = await db.query.kycDocuments.findMany({
        where: eq(kycDocuments.userId, user.id),
        orderBy: [desc(kycDocuments.uploadedAt)],
      });
      return { ...user, documents: docs };
    }));

    return usersWithDocs;
  } catch (error) {
    return [];
  }
}

export async function getKycDocuments(userId: string) {
  try {
    return await db.query.kycDocuments.findMany({
      where: eq(kycDocuments.userId, userId),
      orderBy: [desc(kycDocuments.uploadedAt)],
    });
  } catch (error) {
    return [];
  }
}

export async function getAllUsers() {
  try {
    return await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
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
      orderBy: [desc(bookings.timeslot)],
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
      } as any,
      orderBy: [desc(complaints.createdAt)],
      limit: 10
    });
  } catch (error) {
    return [];
  }
}

export async function getComplaintStats() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Resolved in last 24h
    const [resolved24h] = await db.select({ value: count() })
      .from(complaints)
      .where(and(
        eq(complaints.status, 'resolved'),
        gte(complaints.createdAt, twentyFourHoursAgo)
      ));

    // High priority (open complaints)
    const [openCount] = await db.select({ value: count() })
      .from(complaints)
      .where(eq(complaints.status, 'open'));

    return {
      resolved24h: Number(resolved24h?.value || 0),
      highPriority: Number(openCount?.value || 0)
    };
  } catch (error) {
    console.error('Complaint Stats Error:', error);
    return {
      resolved24h: 0,
      highPriority: 0
    };
  }
}

export async function getUserBalance(userId: string) {
  try {
    const result = await db.select({
      balance: sql<number>`
        COALESCE(SUM(CASE WHEN type IN ('deposit', 'momo') THEN amount ELSE -amount END), 0)
      `
    }).from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.status, 'success')));

    return Number(result[0]?.balance || 0);
  } catch (error) {
    console.error('Balance Calculation Error:', error);
    return 0;
  }
}

export async function verifyKyc(userId: string, documentId?: string) {
  try {
    // Update all pending documents for this user as verified
    if (documentId) {
      await db.update(kycDocuments)
        .set({
          status: 'verified',
          reviewedAt: new Date(),
          reviewedBy: 'admin'
        })
        .where(eq(kycDocuments.id, documentId));
    } else {
      await db.update(kycDocuments)
        .set({
          status: 'verified',
          reviewedAt: new Date(),
          reviewedBy: 'admin'
        })
        .where(eq(kycDocuments.userId, userId));
    }

    await db.update(users)
      .set({ kycStatus: 'verified' })
      .where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    console.error('KYC Verification Error:', error);
    return { error: 'Failed to verify KYC' };
  }
}

export async function rejectKyc(userId: string, rejectionReason: string, documentId?: string) {
  try {
    // Update documents as rejected with reason
    if (documentId) {
      await db.update(kycDocuments)
        .set({
          status: 'rejected',
          reviewedAt: new Date(),
          reviewedBy: 'admin',
          rejectionReason
        })
        .where(eq(kycDocuments.id, documentId));
    } else {
      await db.update(kycDocuments)
        .set({
          status: 'rejected',
          reviewedAt: new Date(),
          reviewedBy: 'admin',
          rejectionReason
        })
        .where(eq(kycDocuments.userId, userId));
    }

    await db.update(users)
      .set({ kycStatus: 'rejected' })
      .where(eq(users.id, userId));
    return { success: true };
  } catch (error) {
    console.error('KYC Rejection Error:', error);
    return { error: 'Failed to reject KYC' };
  }
}

export async function resolveComplaint(complaintId: string) {
  try {
    await db.update(complaints)
      .set({ status: 'resolved' })
      .where(eq(complaints.id, complaintId));
    return { success: true };
  } catch (error) {
    console.error('Complaint Resolution Error:', error);
    return { error: 'Failed to resolve complaint' };
  }
}

export async function sendAdminMessage(complaintId: string, message: string) {
  try {
    await db.insert(messages).values({
      id: randomUUID(),
      complaintId,
      senderId: 'admin',
      message,
      createdAt: new Date(),
    });

    // Reopen the complaint if it was resolved
    await db.update(complaints)
      .set({ status: 'open' })
      .where(eq(complaints.id, complaintId));

    return { success: true };
  } catch (error) {
    console.error('Admin Message Error:', error);
    return { error: 'Failed to send message' };
  }
}

export async function getComplaintWithMessages(complaintId: string) {
  try {
    const complaint = await db.query.complaints.findFirst({
      where: eq(complaints.id, complaintId),
      with: {
        user: true,
      } as any,
    });

    if (!complaint) return null;

    const msgs = await db.query.messages.findMany({
      where: eq(messages.complaintId, complaintId),
      orderBy: [desc(messages.createdAt)],
    });

    return {
      ...complaint,
      messages: msgs,
    };
  } catch (error) {
    console.error('Error fetching complaint with messages:', error);
    return null;
  }
}