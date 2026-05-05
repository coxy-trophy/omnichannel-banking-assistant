'use server';

import { db } from '@/db';
import { users, complaints } from '@/db/schema';
import { getSession } from '@/app/actions';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export async function getKycStatus() {
  const session = await getSession();
  if (!session.data?.user) {
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.data.user.id),
    });
    return user;
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return null;
  }
}

export async function submitKyc() {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  try {
    await db.update(users)
      .set({ kycStatus: 'pending' })
      .where(eq(users.id, session.data.user.id));

    return { success: true };
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return { error: 'Failed to submit KYC' };
  }
}

export async function contactSupport(message: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  try {
    await db.insert(complaints).values({
      id: randomUUID(),
      userId: session.data.user.id,
      category: 'KYC Verification',
      message,
      status: 'open',
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error contacting support:', error);
    return { error: 'Failed to send message' };
  }
}