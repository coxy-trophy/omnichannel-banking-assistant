'use server';

import { db } from '@/db';
import { complaints, messages, users } from '@/db/schema';
import { getSession } from '@/app/actions';
import { randomUUID } from 'crypto';
import { desc, eq } from 'drizzle-orm';

export async function createComplaint(data: { category: string; message: string }) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  const userId = session.data.user.id;

  try {
    const complaintId = randomUUID();

    await db.insert(complaints).values({
      id: complaintId,
      userId,
      category: data.category,
      message: data.message,
      status: 'open',
      createdAt: new Date(),
    });

    return { success: true, complaintId };
  } catch (error) {
    console.error('Error creating complaint:', error);
    return { error: 'Failed to submit complaint' };
  }
}

export async function getUserComplaints() {
  const session = await getSession();
  if (!session.data?.user) {
    return [];
  }

  try {
    return await db.query.complaints.findMany({
      where: eq(complaints.userId, session.data.user.id),
      orderBy: [desc(complaints.createdAt)],
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
}

export async function getComplaintMessages(complaintId: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return [];
  }

  try {
    return await db.query.messages.findMany({
      where: eq(messages.complaintId, complaintId),
      orderBy: [desc(messages.createdAt)],
      with: {
        sender: true,
      } as any,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(complaintId: string, message: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return { error: 'Not authenticated' };
  }

  try {
    await db.insert(messages).values({
      id: randomUUID(),
      complaintId,
      senderId: session.data.user.id,
      message,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: 'Failed to send message' };
  }
}