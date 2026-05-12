'use server';

import { db } from '@/db';
import { complaints, messages, users } from '@/db/schema';
import { getSession } from '@/app/actions';
import { randomUUID } from 'crypto';
import { desc, eq, and } from 'drizzle-orm';

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

    // Add the initial message as well
    await db.insert(messages).values({
      id: randomUUID(),
      complaintId,
      senderId: userId,
      message: data.message,
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

export async function getComplaintById(complaintId: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return null;
  }

  try {
    const complaint = await db.query.complaints.findFirst({
      where: and(
        eq(complaints.id, complaintId),
        eq(complaints.userId, session.data.user.id)
      ),
    });
    return complaint;
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return null;
  }
}

export async function getComplaintMessages(complaintId: string) {
  const session = await getSession();
  if (!session.data?.user) {
    return [];
  }

  try {
    // Verify user has access to this complaint
    const complaint = await db.query.complaints.findFirst({
      where: eq(complaints.id, complaintId),
    });

    if (!complaint || complaint.userId !== session.data.user.id) {
      return [];
    }

    return await db.query.messages.findMany({
      where: eq(messages.complaintId, complaintId),
      orderBy: [desc(messages.createdAt)],
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
    // Verify user has access to this complaint
    const complaint = await db.query.complaints.findFirst({
      where: eq(complaints.id, complaintId),
    });

    if (!complaint || complaint.userId !== session.data.user.id) {
      return { error: 'Unauthorized' };
    }

    await db.insert(messages).values({
      id: randomUUID(),
      complaintId,
      senderId: session.data.user.id,
      message,
      createdAt: new Date(),
    });

    // Update complaint status to open if it was resolved
    await db.update(complaints)
      .set({ status: 'open' })
      .where(eq(complaints.id, complaintId));

    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: 'Failed to send message' };
  }
}

export async function getComplaintsWithMessages() {
  const session = await getSession();
  if (!session.data?.user) {
    return [];
  }

  try {
    const userComplaints = await db.query.complaints.findMany({
      where: eq(complaints.userId, session.data.user.id),
      orderBy: [desc(complaints.createdAt)],
    });

    // Get the latest message for each complaint
    const complaintsWithMessages = await Promise.all(
      userComplaints.map(async (complaint) => {
        const latestMessage = await db.query.messages.findFirst({
          where: eq(messages.complaintId, complaint.id),
          orderBy: [desc(messages.createdAt)],
        });
        return {
          ...complaint,
          lastMessage: latestMessage?.message,
          lastMessageAt: latestMessage?.createdAt,
        };
      })
    );

    return complaintsWithMessages;
  } catch (error) {
    console.error('Error fetching complaints with messages:', error);
    return [];
  }
}